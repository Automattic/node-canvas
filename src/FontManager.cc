#include <cassert>

#include "FontManager.h"
#include "FontFaceSet.h"
#include "Util.h"

void
FontManager::narrowByStretch(
  std::vector<FontDescriptor*>& fonts,
  FontProperties& properties
) {
  size_t matchBegin = 0;
  size_t matchEnd = 0;
  uint16_t bestScore = 151; // max distance is 150

  std::sort(
    fonts.begin(),
    fonts.end(),
    [](FontDescriptor* a, FontDescriptor* b) {
      return a->stretch < b->stretch;
    }
  );

  for (size_t i = 0; i < fonts.size(); i++) {
    if (fonts[i]->stretch == properties.stretch) {
      if (matchBegin == matchEnd) {
        matchBegin = i;
        matchEnd = i + 1;
      } else {
        matchEnd++;
      }
    } else {
      uint16_t score = properties.stretch > fonts[i]->stretch
        ? properties.stretch - fonts[i]->stretch
        : fonts[i]->stretch - properties.stretch;
      if (score < bestScore) bestScore = score;
    }
  }

  if (matchBegin == matchEnd) { // no exact match
    bool inScore = false;

    if (properties.stretch > 100) {
      std::reverse(fonts.begin(), fonts.end());
    }

    for (size_t i = 0; i < fonts.size(); i++) {
      uint16_t score = properties.stretch > fonts[i]->stretch
        ? properties.stretch - fonts[i]->stretch
        : fonts[i]->stretch - properties.stretch;

      if (inScore) {
        if (score == bestScore) {
          matchEnd++;
        } else {
          break;
        }
      } else if (score == bestScore) {
        matchBegin = i;
        matchEnd = i + 1;
        inScore = true;
      }
    }
  }

  if (matchBegin < matchEnd) {
    fonts.erase(fonts.begin() + matchEnd, fonts.end());
    fonts.erase(fonts.begin(), fonts.begin() + matchBegin);
  }
}

void
FontManager::narrowByStyle(
  std::vector<FontDescriptor*>& fonts,
  FontProperties& properties
) {
  size_t nNormal = 0;
  size_t nItalic = 0;
  size_t nOblique = 0;

  for (FontDescriptor* font : fonts) {
    switch (font->style) {
      case FontStyle::Normal: nNormal++; break;
      case FontStyle::Italic: nItalic++; break;
      case FontStyle::Oblique: nOblique++; break;
    }
  }

  FontStyle choose;
  switch (properties.style) {
    case FontStyle::Normal:
      choose = nNormal ? FontStyle::Normal : nOblique ? FontStyle::Oblique : FontStyle::Italic;
    break;
    case FontStyle::Italic:
      choose = nItalic ? FontStyle::Italic : nOblique ? FontStyle::Oblique : FontStyle::Normal;
    break;
    case FontStyle::Oblique:
      choose = nOblique ? FontStyle::Oblique : nItalic ? FontStyle::Italic : FontStyle::Normal;
    break;
  }

  for (size_t i = 0; i < fonts.size(); ) {
    if (fonts[i]->style != choose) {
      std::swap(fonts[i], fonts[fonts.size() - 1]);
      fonts.pop_back();
    } else {
      i++;
    }
  }
}

FontDescriptor*
FontManager::narrowByWeight(
  std::vector<FontDescriptor*> fonts,
  FontProperties& properties
) {
  std::sort(
    fonts.begin(),
    fonts.end(),
    [](FontDescriptor* a, FontDescriptor* b) {
      return a->weight < b->weight;
    }
  );

  assert(fonts.size() && "Precondition failed: 1 or 0 fonts in the set");

  for (FontDescriptor* font : fonts) {
    if (font->weight == properties.weight) {
      return font;
    }
  }

  FontDescriptor* bestBelow = nullptr;
  size_t bestBelowDistance = 900; // max possible is 800
  FontDescriptor* bestAbove = nullptr;
  size_t bestAboveDistance = 900;
  size_t divider = properties.weight == 400 ? 500
    : properties.weight == 500 ? 400
    : properties.weight;

  for (FontDescriptor* font : fonts) {
    size_t distance = font->weight < properties.weight
      ? properties.weight - font->weight
      : font->weight - properties.weight;

    if (font->weight < divider) {
      if (distance < bestBelowDistance) {
        bestBelow = font;
        bestBelowDistance = distance;
      }
    } else {
      if (distance < bestAboveDistance) {
        bestAbove = font;
        bestAboveDistance = distance;
      }
    }
  }

  if (bestBelow && bestAbove) {
    if (bestBelowDistance == bestAboveDistance) {
      return divider <= 500 ? bestBelow : bestAbove;
    } else if (bestBelowDistance < bestAboveDistance) {
      return bestBelow;
    } else {
      return bestAbove;
    }
  } else {
    return bestBelow ? bestBelow : bestAbove;
  }
}

/**
 * NOTE: the FontDescriptor is owned by the FontManager; do not use it again!
 */
std::vector<FontDescriptor*>
FontManager::query(
  FontProperties& properties,
  FontFaceSet* registered,
  std::vector<std::string>& fallbacks
) {
  std::vector<FontDescriptor*> allFamilyResults;
  std::vector<FontDescriptor*> familyResults;

  auto maybeAdd = [&](FontDescriptor* desc) {
    if (
      std::find(
        familyResults.begin(),
        familyResults.end(),
        desc
      ) == familyResults.end()
    ) familyResults.push_back(desc);
  };

  for (const std::string& family : properties.families) {
    auto genericFamilies = getGenericList(family);
    if (genericFamilies) {
      for (const std::string& family : **genericFamilies) {
        if (auto it = system_fonts.find(family); it != system_fonts.end()) {
          std::vector<FontDescriptor>& fonts = it->second;
          for (FontDescriptor& desc : fonts) maybeAdd(&desc);
        }
      }
    } else {
      for (auto& entry : registered->facesData) {
        if (entry.face == nullptr) continue;
        std::string_view family2(entry.face->descriptor.family.get());
        if (FontFamilyEqual{}(family, family2)) {
          maybeAdd(&(entry.face->descriptor));
        }
      }
      if (auto it = system_fonts.find(family); it != system_fonts.end()) {
        std::vector<FontDescriptor>& fonts = it->second;
        for (FontDescriptor& desc : fonts) maybeAdd(&desc);
      }
    }

    if (familyResults.size() == 1) {
      allFamilyResults.push_back(familyResults[0]);
      familyResults.clear();
    } else if (familyResults.size() > 1) {
      narrowByStretch(familyResults, properties);
      narrowByStyle(familyResults, properties);
      allFamilyResults.push_back(narrowByWeight(familyResults, properties));
      familyResults.clear();
    }
  }

  for (const std::string& fallback : fallbacks) {
    if (auto it = system_fonts.find(fallback); it != system_fonts.end()) {
      std::vector<FontDescriptor>& fonts = it->second;
      for (FontDescriptor& desc : fonts) maybeAdd(&desc);
    }

    if (familyResults.size() == 1) {
      allFamilyResults.push_back(familyResults[0]);
      familyResults.clear();
    } else if (familyResults.size() > 1) {
      narrowByStretch(familyResults, properties);
      narrowByStyle(familyResults, properties);
      allFamilyResults.push_back(narrowByWeight(familyResults, properties));
      familyResults.clear();
    }
  }

  return allFamilyResults;
}

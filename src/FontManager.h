#pragma once

#include <unordered_map>
#include <vector>
#include <string_view>
#include <cctype>

#include "Font.h"
#include "FontFaceSet.h"
#include "unicode.h"

struct FontFamilyHash {
  size_t operator()(std::string_view str) const {
    size_t hash = 5381; // DJB2 starting constant
    size_t start = 0;
    size_t end = str.length();
    while (start < end && std::isspace(str[start])) start++;
    while (end > start && std::isspace(str[end - 1])) end--;
    for (size_t i = start; i < end; i++) {
      hash = (hash << 5) + hash + std::tolower(str[i]);
    }
    return hash;
  }
};

struct FontFamilyEqual {
  bool operator()(std::string_view s1, std::string_view s2) const {
    size_t start1 = 0;
    size_t end1 = s1.length();
    size_t start2 = 0;
    size_t end2 = s2.length();

    while (start1 < end1 && std::isspace(s1[start1])) start1++;
    while (end1 > start1 && std::isspace(s1[end1 - 1])) end1--;

    while (start2 < end2 && std::isspace(s2[start2])) start2++;
    while (end2 > start2 && std::isspace(s2[end2 - 1])) end2--;

    if (end1 - start1 != end2 - start2) return false;

    for (size_t i = 0; i < end1 - start1; i++) {
      if (std::tolower(s1[start1 + i]) != std::tolower(s2[start2 + i])) {
        return false;
      }
    }

    return true;
  }
};

using SystemFonts = std::unordered_map<
  std::string,
  std::vector<FontDescriptor>,
  FontFamilyHash,
  FontFamilyEqual
>;

class FontManager {
  public:
    virtual ~FontManager() = default;

    virtual void readSystemFonts() = 0;

    virtual void populateFallbackFonts(
      std::vector<std::string>& families,
      script_t script
    ) = 0;

    virtual std::optional<const std::vector<std::string>*> getGenericList(
      const std::string& generic
    ) = 0;

    std::vector<FontDescriptor*> query(
      FontProperties& properties,
      FontFaceSet* registered,
      std::vector<std::string>& fallbacks
    );

  private:
    void narrowByStretch(
      std::vector<FontDescriptor*>& fonts,
      FontProperties& properties
    );

    void narrowByStyle(
      std::vector<FontDescriptor*>& fonts,
      FontProperties& properties
    );

    FontDescriptor* narrowByWeight(
      std::vector<FontDescriptor*> fonts,
      FontProperties& properties
    );

  protected:
    SystemFonts system_fonts;
};

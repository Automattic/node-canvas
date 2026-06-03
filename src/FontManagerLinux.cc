// Copyright (c) 2025 Caleb Hearon <caleb@chearon.net>

#include <fontconfig/fontconfig.h>

#include <cstring>
#include <unordered_set>

#include "FontManagerLinux.h"
#include "Font.h"
#include "unicode.h"

static std::string
familyForGeneric(const char* generic) {
  FcPattern* pattern = FcPatternCreate();
  FcPatternAddString(pattern, FC_FAMILY, reinterpret_cast<const FcChar8*>(generic));
  FcConfigSubstitute(nullptr, pattern, FcMatchPattern);
  FcDefaultSubstitute(pattern);

  FcResult result;
  FcPattern* match = FcFontMatch(nullptr, pattern, &result);

  std::string name;
  if (match) {
    FcChar8* family = nullptr;
    if (FcPatternGetString(match, FC_FAMILY, 0, &family) == FcResultMatch) {
      name = reinterpret_cast<const char*>(family);
    }
    FcPatternDestroy(match);
  }

  FcPatternDestroy(pattern);
  return name;
}

static void
addFamilyFromFcSort(FcPattern* pattern, std::vector<std::string>& results) {
  FcConfigSubstitute(nullptr, pattern, FcMatchPattern);
  FcDefaultSubstitute(pattern);

  FcResult result;
  FcFontSet* set = FcFontSort(nullptr, pattern, FcFalse, nullptr, &result);

  for (int i = 0; i < set->nfont; i++) {
    FcChar8* family = nullptr;
    if (FcPatternGetString(set->fonts[i], FC_FAMILY, 0, &family) == FcResultMatch) {
      results.push_back(std::string((char*)family));
      break;
    }
  }

  FcFontSetDestroy(set);
}

static void
addFamilyForChars(
  std::vector<std::string>& list,
  FcPattern* pattern,
  uint32_t cp1,
  uint32_t cp2
) {
  FcCharSet* cset = FcCharSetCreate();
  FcCharSetAddChar(cset, cp1);
  FcCharSetAddChar(cset, cp2);
  FcPatternAddString(pattern, FC_FAMILY, (FcChar8*)"sans");
  FcPatternAddCharSet(pattern, FC_CHARSET, cset);
  addFamilyFromFcSort(pattern, list);
  FcCharSetDestroy(cset);
}

const std::vector<std::string>&
FontManagerLinux::langFamilies(const std::string& lang) {
  auto it = lang_cache.find(lang);
  if (it != lang_cache.end()) return it->second;

  FcPattern* pattern = FcPatternCreate();
  FcPatternAddString(pattern, FC_LANG, reinterpret_cast<const FcChar8*>(lang.c_str()));
  std::vector<std::string> results;
  addFamilyFromFcSort(pattern, results);
  FcPatternDestroy(pattern);

  return lang_cache.emplace(lang, std::move(results)).first->second;
}

static uint16_t
convertWeight(int fcWeight) {
  int ot = FcWeightToOpenType(fcWeight);
  if (ot < 1) return 400;
  if (ot > 1000) return 1000;
  return static_cast<uint16_t>(ot);
}

static FontStyle
convertSlant(int slant) {
  switch (slant) {
    case FC_SLANT_ITALIC:  return FontStyle::Italic;
    case FC_SLANT_OBLIQUE: return FontStyle::Oblique;
    case FC_SLANT_ROMAN:
    default:               return FontStyle::Normal;
  }
}

void
FontManagerLinux::readSystemFonts() {
  FcInit();

  for (const char* generic : {"serif", "sans-serif", "monospace", "cursive", "fantasy"}) {
    std::string resolved = familyForGeneric(generic);
    if (!resolved.empty()) generic_fonts[generic].push_back(std::move(resolved));
  }

  {
    FcPattern* pattern = FcPatternCreate();
    FcPatternAddBool(pattern, FC_COLOR, FcTrue);
    addFamilyForChars(emoji_fonts, pattern, 0x1f602, 0x1f602); // face with tears of joy
    FcPatternDestroy(pattern);
  }

  {
    FcPattern* pattern = FcPatternCreate();
    addFamilyForChars(symbol_fonts, pattern, 0x2192, 0x1f846); // right arow, thick right arrow
    FcPatternDestroy(pattern);
  }

  FcPattern* pattern = FcPatternCreate();
  FcObjectSet* objects = FcObjectSetBuild(
    FC_FAMILY, FC_FILE, FC_INDEX, FC_WEIGHT, FC_WIDTH, FC_SLANT, nullptr
  );

  FcFontSet* set = FcFontList(nullptr, pattern, objects);

  if (set) {
    system_fonts.reserve(set->nfont);

    for (int i = 0; i < set->nfont; i++) {
      FcPattern* font = set->fonts[i];

      FcChar8* file = nullptr;
      FcChar8* family = nullptr;
      if (FcPatternGetString(font, FC_FILE, 0, &file) != FcResultMatch) continue;
      if (FcPatternGetString(font, FC_FAMILY, 0, &family) != FcResultMatch) continue;

      FontDescriptor desc;

      size_t fileLength = std::strlen((const char*)file) + 1;
      desc.url = std::make_unique<char[]>(fileLength);
      std::memcpy(desc.url.get(), file, fileLength);

      size_t familyLength = std::strlen((const char*)family) + 1;
      desc.family = std::make_unique<char[]>(familyLength);
      std::memcpy(desc.family.get(), family, familyLength);

      int index = 0;
      FcPatternGetInteger(font, FC_INDEX, 0, &index);
      desc.index = (size_t)index;

      int weight = FC_WEIGHT_NORMAL;
      FcPatternGetInteger(font, FC_WEIGHT, 0, &weight);
      desc.weight = convertWeight(weight);

      int width = FC_WIDTH_NORMAL;
      FcPatternGetInteger(font, FC_WIDTH, 0, &width);
      desc.stretch = (uint16_t)(width);

      int slant = FC_SLANT_ROMAN;
      FcPatternGetInteger(font, FC_SLANT, 0, &slant);
      desc.style = convertSlant(slant);

      system_fonts.push_back(std::move(desc));
    }

    FcFontSetDestroy(set);
  }

  FcObjectSetDestroy(objects);
  FcPatternDestroy(pattern);
}

void
FontManagerLinux::populateFallbackFonts(
  std::vector<std::string>& families,
  script_t script
) {
  const char* lang = nullptr;

  switch (script) {
    case SCRIPT_COMMON:
    case SCRIPT_INHERITED:
    case SCRIPT_LATIN:
      lang = "en";
      break;
    case SCRIPT_CYRILLIC: lang = "ru"; break;
    case SCRIPT_GREEK: lang = "el"; break;
    case SCRIPT_ARMENIAN: lang = "hy"; break;
    case SCRIPT_HEBREW: lang = "he"; break;
    case SCRIPT_ARABIC: lang = "ar"; break;
    case SCRIPT_SYRIAC: lang = "syr"; break;
    case SCRIPT_THAANA: lang = "dv"; break;
    case SCRIPT_DEVANAGARI: lang = "hi"; break;
    case SCRIPT_BENGALI: lang = "bn"; break;
    case SCRIPT_GUJARATI: lang = "gu"; break;
    case SCRIPT_GURMUKHI: lang = "pa"; break;
    case SCRIPT_KANNADA: lang = "kn"; break;
    case SCRIPT_MALAYALAM: lang = "ml"; break;
    case SCRIPT_ORIYA: lang = "or"; break;
    case SCRIPT_TAMIL: lang = "ta"; break;
    case SCRIPT_TELUGU: lang = "te"; break;
    case SCRIPT_SINHALA: lang = "si"; break;
    case SCRIPT_THAI: lang = "th"; break;
    case SCRIPT_LAO: lang = "lo"; break;
    case SCRIPT_TIBETAN: lang = "bo"; break;
    case SCRIPT_MYANMAR: lang = "my"; break;
    case SCRIPT_KHMER: lang = "km"; break;
    case SCRIPT_GEORGIAN: lang = "ka"; break;
    case SCRIPT_ETHIOPIC: lang = "am"; break;
    case SCRIPT_CHEROKEE: lang = "chr"; break;
    case SCRIPT_CANADIAN_ABORIGINAL: lang = "iu"; break;
    case SCRIPT_YI: lang = "ii"; break;
    case SCRIPT_COPTIC: lang = "cop"; break;
    case SCRIPT_GOTHIC: lang = "got"; break;
    case SCRIPT_NKO: lang = "nqo"; break;
    case SCRIPT_TIFINAGH: lang = "ber-ma"; break;
    case SCRIPT_MONGOLIAN: lang = "mn-cn"; break;
    case SCRIPT_HANGUL: lang = "ko"; break;
    case SCRIPT_HAN:
    case SCRIPT_BOPOMOFO:
      lang = "zh-cn";
      break;
    case SCRIPT_HIRAGANA:
    case SCRIPT_KATAKANA:
      lang = "ja";
      break;

    // These scripts don't appear to be covered by FontConfig .orth files
    case SCRIPT_DESERET:
      families.push_back("Noto Sans Deseret");
      break;
    case SCRIPT_OGHAM:
      families.push_back("Noto Sans Ogham");
      break;
    case SCRIPT_OLD_ITALIC:
      families.push_back("Noto Sans Old Italic");
      break;
    case SCRIPT_RUNIC:
      families.push_back("Noto Sans Runic");
      break;
    case SCRIPT_TAGALOG:
      families.push_back("Noto Sans Tagalog");
      break;
    case SCRIPT_HANUNOO:
      families.push_back("Noto Sans Hanunoo");
      break;
    case SCRIPT_BUHID:
      families.push_back("Noto Sans Buhid");
      break;
    case SCRIPT_TAGBANWA:
      families.push_back("Noto Sans Tagbanwa");
      break;
    case SCRIPT_BRAILLE:
      families.push_back("Noto Sans Symbols2");
      break;
    case SCRIPT_CYPRIOT:
      families.push_back("Noto Sans Cypriot");
      break;
    case SCRIPT_LIMBU:
      families.push_back("Noto Sans Limbu");
      break;
    case SCRIPT_LINEAR_B:
      families.push_back("Noto Sans Linear B");
      break;
    case SCRIPT_OSMANYA:
      families.push_back("Noto Sans Osmanya");
      break;
    case SCRIPT_SHAVIAN:
      families.push_back("Noto Sans Shavian");
      break;
    case SCRIPT_TAI_LE:
      families.push_back("Noto Sans Tai Le");
      break;
    case SCRIPT_UGARITIC:
      families.push_back("Noto Sans Ugaritic");
      break;
    case SCRIPT_BUGINESE:
      families.push_back("Noto Sans Buginese");
      break;
    case SCRIPT_GLAGOLITIC:
      families.push_back("Noto Sans Glagolitic");
      break;
    case SCRIPT_KHAROSHTHI:
      families.push_back("Noto Sans Kharoshthi");
      break;
    case SCRIPT_SYLOTI_NAGRI:
      families.push_back("Noto Sans Syloti Nagri");
      break;
    case SCRIPT_NEW_TAI_LUE:
      families.push_back("Noto Sans New Tai Lue");
      break;
    case SCRIPT_OLD_PERSIAN:
      families.push_back("Noto Sans Old Persian");
      break;
    case SCRIPT_BALINESE:
      families.push_back("Noto Sans Balinese");
      break;
    case SCRIPT_BATAK:
      families.push_back("Noto Sans Batak");
      break;
    case SCRIPT_BRAHMI:
      families.push_back("Noto Sans Brahmi");
      break;
    case SCRIPT_CHAM:
      families.push_back("Noto Sans Cham");
      break;
    case SCRIPT_EGYPTIAN_HIEROGLYPHS:
      families.push_back("Noto Sans Egyptian Hieroglyphs");
      break;
    case SCRIPT_PAHAWH_HMONG:
      families.push_back("Noto Sans Pahawh Hmong");
      break;
    case SCRIPT_OLD_HUNGARIAN:
      families.push_back("Noto Sans Old Hungarian");
      break;
    case SCRIPT_JAVANESE:
      families.push_back("Noto Sans Javanese");
      break;
    case SCRIPT_KAYAH_LI:
      families.push_back("Noto Sans Kayah Li");
      break;
    case SCRIPT_LEPCHA:
      families.push_back("Noto Sans Lepcha");
      break;
    case SCRIPT_LINEAR_A:
      families.push_back("Noto Sans Linear A");
      break;
    case SCRIPT_MANDAIC:
      families.push_back("Noto Sans Mandaic");
      break;
    case SCRIPT_OLD_TURKIC:
      families.push_back("Noto Sans Old Turkic");
      break;
    case SCRIPT_OLD_PERMIC:
      families.push_back("Noto Sans Old Permic");
      break;
    case SCRIPT_PHAGS_PA:
      families.push_back("Noto Sans PhagsPa");
      break;
    case SCRIPT_PHOENICIAN:
      families.push_back("Noto Sans Phoenician");
      break;
    case SCRIPT_MIAO:
      families.push_back("Noto Sans Miao");
      break;
    case SCRIPT_VAI:
      families.push_back("Noto Sans Vai");
      break;
    case SCRIPT_CUNEIFORM:
      families.push_back("Noto Sans Cuneiform");
      break;
    case SCRIPT_CARIAN:
      families.push_back("Noto Sans Carian");
      break;
    case SCRIPT_TAI_THAM:
      families.push_back("Noto Sans Tai Tham");
      break;
    case SCRIPT_LYCIAN:
      families.push_back("Noto Sans Lycian");
      break;
    case SCRIPT_LYDIAN:
      families.push_back("Noto Sans Lydian");
      break;
    case SCRIPT_OL_CHIKI:
      families.push_back("Noto Sans Ol Chiki");
      break;
    case SCRIPT_REJANG:
      families.push_back("Noto Sans Rejang");
      break;
    case SCRIPT_SAURASHTRA:
      families.push_back("Noto Sans Saurashtra");
      break;
    case SCRIPT_SUNDANESE:
      families.push_back("Noto Sans Sundanese");
      break;
    case SCRIPT_MEETEI_MAYEK:
      families.push_back("Noto Sans Meetei Mayek");
      break;
    case SCRIPT_IMPERIAL_ARAMAIC:
      families.push_back("Noto Sans Imperial Aramaic");
      break;
    case SCRIPT_AVESTAN:
      families.push_back("Noto Sans Avestan");
      break;
    case SCRIPT_CHAKMA:
      families.push_back("Noto Sans Chakma");
      break;
    case SCRIPT_KAITHI:
      families.push_back("Noto Sans Kaithi");
      break;
    case SCRIPT_MANICHAEAN:
      families.push_back("Noto Sans Manichaean");
      break;
    case SCRIPT_INSCRIPTIONAL_PAHLAVI:
      families.push_back("Noto Sans Inscriptional Pahlavi");
      break;
    case SCRIPT_PSALTER_PAHLAVI:
      families.push_back("Noto Sans Psalter Pahlavi");
      break;
    case SCRIPT_INSCRIPTIONAL_PARTHIAN:
      families.push_back("Noto Sans Inscriptional Parthian");
      break;
    case SCRIPT_SAMARITAN:
      families.push_back("Noto Sans Samaritan");
      break;
    case SCRIPT_TAI_VIET:
      families.push_back("Noto Sans Tai Viet");
      break;
    case SCRIPT_BAMUM:
      families.push_back("Noto Sans Bamum");
      break;
    case SCRIPT_LISU:
      families.push_back("Noto Sans Lisu");
      break;
    case SCRIPT_OLD_SOUTH_ARABIAN:
      families.push_back("Noto Sans Old South Arabian");
      break;
    case SCRIPT_BASSA_VAH:
      families.push_back("Noto Sans Bassa Vah");
      break;
    case SCRIPT_DUPLOYAN:
      families.push_back("Noto Sans Duployan");
      break;
    case SCRIPT_ELBASAN:
      families.push_back("Noto Sans Elbasan");
      break;
    case SCRIPT_GRANTHA:
      families.push_back("Noto Sans Grantha");
      break;
    case SCRIPT_MENDE_KIKAKUI:
      families.push_back("Noto Sans Mende Kikakui");
      break;
    case SCRIPT_MEROITIC_CURSIVE:
    case SCRIPT_MEROITIC_HIEROGLYPHS:
      families.push_back("Noto Sans Meroitic");
      break;
    case SCRIPT_OLD_NORTH_ARABIAN:
      families.push_back("Noto Sans Old North Arabian");
      break;
    case SCRIPT_NABATAEAN:
      families.push_back("Noto Sans Nabataean");
      break;
    case SCRIPT_PALMYRENE:
      families.push_back("Noto Sans Palmyrene");
      break;
    case SCRIPT_KHUDAWADI:
      families.push_back("Noto Sans Khudawadi");
      break;
    case SCRIPT_WARANG_CITI:
      families.push_back("Noto Sans Warang Citi");
      break;
    case SCRIPT_MRO:
      families.push_back("Noto Sans Mro");
      break;
    case SCRIPT_SHARADA:
      families.push_back("Noto Sans Sharada");
      break;
    case SCRIPT_SORA_SOMPENG:
      families.push_back("Noto Sans Sora Sompeng");
      break;
    case SCRIPT_TAKRI:
      families.push_back("Noto Sans Takri");
      break;
    case SCRIPT_KHOJKI:
      families.push_back("Noto Sans Khojki");
      break;
    case SCRIPT_TIRHUTA:
      families.push_back("Noto Sans Tirhuta");
      break;
    case SCRIPT_CAUCASIAN_ALBANIAN:
      families.push_back("Noto Sans Caucasian Albanian");
      break;
    case SCRIPT_MAHAJANI:
      families.push_back("Noto Sans Mahajani");
      break;
    case SCRIPT_AHOM:
      families.push_back("Noto Serif Ahom");
      break;
    case SCRIPT_HATRAN:
      families.push_back("Noto Sans Hatran");
      break;
    case SCRIPT_MODI:
      families.push_back("Noto Sans Modi");
      break;
    case SCRIPT_MULTANI:
      families.push_back("Noto Sans Multani");
      break;
    case SCRIPT_PAU_CIN_HAU:
      families.push_back("Noto Sans Pau Cin Hau");
      break;
    case SCRIPT_SIDDHAM:
      families.push_back("Noto Sans Siddham");
      break;
    case SCRIPT_ADLAM:
      families.push_back("Noto Sans Adlam");
      break;
    case SCRIPT_BHAIKSUKI:
      families.push_back("Noto Sans Bhaiksuki");
      break;
    case SCRIPT_MARCHEN:
      families.push_back("Noto Sans Marchen");
      break;
    case SCRIPT_NEWA:
      families.push_back("Noto Sans Newa");
      break;
    case SCRIPT_OSAGE:
      families.push_back("Noto Sans Osage");
      break;
    case SCRIPT_HANIFI_ROHINGYA:
      families.push_back("Noto Sans Hanifi Rohingya");
      break;
    case SCRIPT_WANCHO:
      families.push_back("Noto Sans Wancho");
      break;
    case SCRIPT_ANATOLIAN_HIEROGLYPHS:
      families.push_back("Noto Sans Anatolian Hieroglyphs");
      break;
    case SCRIPT_NUSHU:
      families.push_back("Noto Sans Nushu");
      break;
    case SCRIPT_TANGUT:
      families.push_back("Noto Serif Tangut");
      break;
    case SCRIPT_MASARAM_GONDI:
      families.push_back("Noto Sans Masaram Gondi");
      break;
    case SCRIPT_GUNJALA_GONDI:
      families.push_back("Noto Sans Gunjala Gondi");
      break;
    case SCRIPT_SOYOMBO:
      families.push_back("Noto Sans Soyombo");
      break;
    case SCRIPT_ZANABAZAR_SQUARE:
      families.push_back("Noto Sans Zanabazar Square");
      break;
    case SCRIPT_DOGRA:
      families.push_back("Noto Sans Dogra");
      break;
    case SCRIPT_MAKASAR:
      families.push_back("Noto Sans Makasar");
      break;
    case SCRIPT_MEDEFAIDRIN:
      families.push_back("Noto Sans Medefaidrin");
      break;
    case SCRIPT_SOGDIAN:
      families.push_back("Noto Sans Sogdian");
      break;
    case SCRIPT_OLD_SOGDIAN:
      families.push_back("Noto Sans Old Sogdian");
      break;
    case SCRIPT_ELYMAIC:
      families.push_back("Noto Sans Elymaic");
      break;
    case SCRIPT_NYIAKENG_PUACHUE_HMONG:
      families.push_back("Noto Sans Nyiakeng Puachue Hmong");
      break;
    case SCRIPT_NANDINAGARI:
      families.push_back("Noto Sans Nandinagari");
      break;
    case SCRIPT_CHORASMIAN:
      families.push_back("Noto Sans Chorasmian");
      break;
    case SCRIPT_DIVES_AKURU:
      families.push_back("Noto Sans Dives Akuru");
      break;
    case SCRIPT_KHITAN_SMALL_SCRIPT:
      families.push_back("Noto Sans Khitan Small Script");
      break;
    case SCRIPT_YEZIDI:
      families.push_back("Noto Sans Yezidi");
      break;
    case SCRIPT_OLD_UYGHUR:
      families.push_back("Noto Sans Old Uyghur");
      break;
    case SCRIPT_TANGSA:
      families.push_back("Noto Sans Tangsa");
      break;
    case SCRIPT_TOTO:
      families.push_back("Noto Sans Toto");
      break;
    case SCRIPT_VITHKUQI:
      families.push_back("Noto Sans Vithkuqi");
      break;
    case SCRIPT_KAWI:
      families.push_back("Noto Sans Kawi");
      break;
    case SCRIPT_NAG_MUNDARI:
      families.push_back("Noto Sans Nag Mundari");
      break;
    case SCRIPT_SIGNWRITING:
      families.push_back("Noto Sans SignWriting");
      break;
    case SCRIPT_CYPRO_MINOAN:
      families.push_back("Noto Sans Cypro Minoan");
      break;

    case SCRIPT_NONE:
    case SCRIPT_GARAY:
    case SCRIPT_GURUNG_KHEMA:
    case SCRIPT_KIRAT_RAI:
    case SCRIPT_OL_ONAL:
    case SCRIPT_SUNUWAR:
    case SCRIPT_TODHRI:
    case SCRIPT_TULU_TIGALARI:
      break;
  }

  if (lang) {
    const std::vector<std::string>& fams = langFamilies(lang);
    families.insert(families.end(), fams.begin(), fams.end());
  }

  families.insert(families.end(), emoji_fonts.begin(), emoji_fonts.end());
  families.insert(families.end(), symbol_fonts.begin(), symbol_fonts.end());
}

std::optional<const std::vector<std::string>*>
FontManagerLinux::getGenericList(const std::string& generic) {
  auto it = generic_fonts.find(generic);
  if (it != generic_fonts.end() && !it->second.empty()) return &it->second;
  return std::nullopt;
}

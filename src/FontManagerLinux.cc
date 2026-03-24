// Copyright (c) 2025 Caleb Hearon <caleb@chearon.net>
//
// References:
// - https://searchfox.org/firefox-main/source/gfx/thebes/gfxFcPlatformFontList.cpp

#include <optional>
#include <fontconfig/fontconfig.h>
#include <cstdint>
#include <cstring>

#include "FontManagerLinux.h"

// (directly copied from Firefox's FindCanonicalNameIndex)
// canonical name ==> first en name or first name if no en name
// This is the required logic for fullname lookups as per CSS3 Fonts spec.
static uint32_t get_name_index(
  FcPattern* aFont,
  const char* aLangField
) {
  uint32_t n = 0, en = 0;
  FcChar8* lang;
  while (FcPatternGetString(aFont, aLangField, n, &lang) == FcResultMatch) {
    // look for 'en' or variants, en-US, en-JP etc.
    uint32_t len = strlen((char*)lang);
    bool enPrefix = strncmp((char*)lang, "en", 2) == 0;
    if (enPrefix && (len == 2 || (len > 2 && aLangField[2] == '-'))) {
      en = n;
      break;
    }
    n++;
  }
  return en;
}

static uint16_t
convert_weight(int weight) {
  if (weight <= (FC_WEIGHT_THIN + FC_WEIGHT_EXTRALIGHT) / 2) return 100;
  if (weight <= (FC_WEIGHT_EXTRALIGHT + FC_WEIGHT_LIGHT) / 2) return 200;
  if (weight <= (FC_WEIGHT_LIGHT + FC_WEIGHT_BOOK) / 2) return 300;
  if (weight <= (FC_WEIGHT_REGULAR + FC_WEIGHT_MEDIUM) / 2) return 400;
  if (weight <= (FC_WEIGHT_MEDIUM + FC_WEIGHT_DEMIBOLD) / 2) return 500;
  if (weight <= (FC_WEIGHT_DEMIBOLD + FC_WEIGHT_BOLD) / 2) return 600;
  if (weight <= (FC_WEIGHT_BOLD + FC_WEIGHT_EXTRABOLD) / 2) return 700;
  if (weight <= (FC_WEIGHT_EXTRABOLD + FC_WEIGHT_BLACK) / 2) return 800;
  return 900;
}


static uint16_t
convert_width(int width) {
  if (width <= (FC_WIDTH_ULTRACONDENSED + FC_WIDTH_EXTRACONDENSED) / 2) return 50;
  if (width <= (FC_WIDTH_EXTRACONDENSED + FC_WIDTH_CONDENSED) / 2) return 62;
  if (width <= (FC_WIDTH_CONDENSED + FC_WIDTH_SEMICONDENSED) / 2) return 75;
  if (width <= (FC_WIDTH_SEMICONDENSED + FC_WIDTH_NORMAL) / 2) return 87;
  if (width <= (FC_WIDTH_NORMAL + FC_WIDTH_SEMIEXPANDED) / 2) return 100;
  if (width <= (FC_WIDTH_SEMIEXPANDED + FC_WIDTH_EXPANDED) / 2) return 112;
  if (width <= (FC_WIDTH_EXPANDED + FC_WIDTH_EXTRAEXPANDED) / 2) return 125;
  if (width <= (FC_WIDTH_EXTRAEXPANDED + FC_WIDTH_ULTRAEXPANDED) / 2) return 150;
  return 200;
}

static void
create_font_descriptor(
  std::vector<FontDescriptor>& results,
  FcPattern* pattern
) {
  FontDescriptor desc;

  // family
  uint32_t nameIndex = get_name_index(pattern, FC_FAMILYLANG);
  FcChar8* canonical = nullptr;
  FcPatternGetString(pattern, FC_FAMILY, nameIndex, &canonical);
  if (!canonical) return;
  desc.family = std::make_unique<char[]>(strlen((char*)canonical) + 1);
  strcpy(desc.family.get(), (char*)canonical);

  // weight
  int weight;
  if (FcPatternGetInteger(pattern, FC_WEIGHT, 0, &weight) != FcResultMatch) {
    weight = FC_WEIGHT_REGULAR;
  }
  desc.weight = convert_weight(weight);

  // width
  int width;
  if (FcPatternGetInteger(pattern, FC_WIDTH, 0, &width) != FcResultMatch) {
    width = FC_WIDTH_NORMAL;
  }
  desc.stretch = convert_width(width);

  // italic
  int slant;
  if (FcPatternGetInteger(pattern, FC_SLANT, 0, &slant) != FcResultMatch) {
    slant = FC_SLANT_ROMAN;
  }
  if (slant == FC_SLANT_OBLIQUE) {
    desc.style = FontStyle::Oblique;
  } else if (slant > 0) {
    desc.style = FontStyle::Italic;
  }

  // TTC index
  int index;
  if (FcPatternGetInteger(pattern, FC_INDEX, 0, &index) == FcResultMatch) {
    desc.index = index;
  }

  // file path
  FcChar8* path;
  if (FcPatternGetString(pattern, FC_FILE, 0, &path) == FcResultMatch) {
    desc.url = std::make_unique<char[]>(strlen((char*)path) + 1);
    strcpy(desc.url.get(), (char*)path);
    results.push_back(std::move(desc));
  }
}

void
FontManagerLinux::readSystemFonts(std::vector<FontDescriptor>& results) {
  FcFontSet* set = FcConfigGetFonts(nullptr, FcSetSystem);

  for (int fontIndex = 0; fontIndex < set->nfont; fontIndex++) {
    FcPattern* pattern = set->fonts[fontIndex];
    create_font_descriptor(results, pattern);
  }
}

void FontManagerLinux::populateFallbackFonts(
  std::vector<std::string>& families,
  script_t script
) {
  FcPattern* pattern = FcPatternCreate();

  switch (script) {
    case SCRIPT_ADLAM:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ff");      break;
    case SCRIPT_AHOM:                FcPatternAddString(pattern, FC_LANG, (FcChar8*)"aho");     break;
    case SCRIPT_ANATOLIAN_HIEROGLYPHS: FcPatternAddString(pattern, FC_LANG, (FcChar8*)"hlu");  break;
    case SCRIPT_ARABIC:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ar");      break;
    case SCRIPT_ARMENIAN:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"hy");      break;
    case SCRIPT_AVESTAN:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ae");      break;
    case SCRIPT_BALINESE:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ban");     break;
    case SCRIPT_BAMUM:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bax");     break;
    case SCRIPT_BASSA_VAH:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bsq");     break;
    case SCRIPT_BATAK:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bbc");     break;
    case SCRIPT_BENGALI:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bn");      break;
    case SCRIPT_BHAIKSUKI:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sa");      break;
    case SCRIPT_BOPOMOFO:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"zh");      break;
    case SCRIPT_BRAHMI:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sa");      break;
    case SCRIPT_BRAILLE:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"en");      break;
    case SCRIPT_BUGINESE:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bug");     break;
    case SCRIPT_BUHID:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bku");     break;
    case SCRIPT_CANADIAN_ABORIGINAL: FcPatternAddString(pattern, FC_LANG, (FcChar8*)"cr");      break;
    case SCRIPT_CARIAN:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"xcr");     break;
    case SCRIPT_CAUCASIAN_ALBANIAN:  FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sq");      break;
    case SCRIPT_CHAKMA:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ccp");     break;
    case SCRIPT_CHAM:                FcPatternAddString(pattern, FC_LANG, (FcChar8*)"cjm");     break;
    case SCRIPT_CHEROKEE:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"chr");     break;
    case SCRIPT_CHORASMIAN:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"xco");     break;
    case SCRIPT_COPTIC:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"cop");     break;
    case SCRIPT_CUNEIFORM:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"akk");     break;
    case SCRIPT_CYPRIOT:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"grc");     break;
    case SCRIPT_CYPRO_MINOAN:        FcPatternAddString(pattern, FC_LANG, (FcChar8*)"grc");     break;
    case SCRIPT_CYRILLIC:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ru");      break;
    case SCRIPT_DESERET:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"en");      break;
    case SCRIPT_DEVANAGARI:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"hi");      break;
    case SCRIPT_DIVES_AKURU:         FcPatternAddString(pattern, FC_LANG, (FcChar8*)"dv");      break;
    case SCRIPT_DOGRA:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"dgo");     break;
    case SCRIPT_DUPLOYAN:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"fr");      break;
    case SCRIPT_EGYPTIAN_HIEROGLYPHS: FcPatternAddString(pattern, FC_LANG, (FcChar8*)"egy");   break;
    case SCRIPT_ELBASAN:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sq");      break;
    case SCRIPT_ELYMAIC:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"arc");     break;
    case SCRIPT_ETHIOPIC:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"am");      break;
    case SCRIPT_GARAY:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"wo");      break;
    case SCRIPT_GEORGIAN:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ka");      break;
    case SCRIPT_GLAGOLITIC:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"cu");      break;
    case SCRIPT_GOTHIC:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"got");     break;
    case SCRIPT_GRANTHA:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sa");      break;
    case SCRIPT_GREEK:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"el");      break;
    case SCRIPT_GUJARATI:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"gu");      break;
    case SCRIPT_GUNJALA_GONDI:       FcPatternAddString(pattern, FC_LANG, (FcChar8*)"gon");     break;
    case SCRIPT_GURMUKHI:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"pa");      break;
    case SCRIPT_GURUNG_KHEMA:        FcPatternAddString(pattern, FC_LANG, (FcChar8*)"gvr");     break;
    case SCRIPT_HAN:                 FcPatternAddString(pattern, FC_LANG, (FcChar8*)"zh");      break;
    case SCRIPT_HANGUL:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ko");      break;
    case SCRIPT_HANIFI_ROHINGYA:     FcPatternAddString(pattern, FC_LANG, (FcChar8*)"rhg");     break;
    case SCRIPT_HANUNOO:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"hnn");     break;
    case SCRIPT_HATRAN:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"arc");     break;
    case SCRIPT_HEBREW:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"he");      break;
    case SCRIPT_HIRAGANA:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ja");      break;
    case SCRIPT_IMPERIAL_ARAMAIC:    FcPatternAddString(pattern, FC_LANG, (FcChar8*)"arc");     break;
    case SCRIPT_INSCRIPTIONAL_PAHLAVI: FcPatternAddString(pattern, FC_LANG, (FcChar8*)"pal");  break;
    case SCRIPT_INSCRIPTIONAL_PARTHIAN: FcPatternAddString(pattern, FC_LANG, (FcChar8*)"xpr"); break;
    case SCRIPT_JAVANESE:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"jv");      break;
    case SCRIPT_KAITHI:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bho");     break;
    case SCRIPT_KANNADA:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"kn");      break;
    case SCRIPT_KATAKANA:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ja");      break;
    case SCRIPT_KAWI:                FcPatternAddString(pattern, FC_LANG, (FcChar8*)"kaw");     break;
    case SCRIPT_KAYAH_LI:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"eky");     break;
    case SCRIPT_KHAROSHTHI:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sa");      break;
    case SCRIPT_KHITAN_SMALL_SCRIPT: FcPatternAddString(pattern, FC_LANG, (FcChar8*)"zkt");    break;
    case SCRIPT_KHMER:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"km");      break;
    case SCRIPT_KHOJKI:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sd");      break;
    case SCRIPT_KHUDAWADI:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"snd");     break;
    case SCRIPT_KIRAT_RAI:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"kir");     break;
    case SCRIPT_LAO:                 FcPatternAddString(pattern, FC_LANG, (FcChar8*)"lo");      break;
    case SCRIPT_LATIN:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"en");      break;
    case SCRIPT_LEPCHA:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"lep");     break;
    case SCRIPT_LIMBU:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"lif");     break;
    case SCRIPT_LINEAR_A:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"lab");     break;
    case SCRIPT_LINEAR_B:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"grc");     break;
    case SCRIPT_LISU:                FcPatternAddString(pattern, FC_LANG, (FcChar8*)"lis");     break;
    case SCRIPT_LYCIAN:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"xlc");     break;
    case SCRIPT_LYDIAN:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"xld");     break;
    case SCRIPT_MAHAJANI:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mwr");     break;
    case SCRIPT_MAKASAR:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mak");     break;
    case SCRIPT_MALAYALAM:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ml");      break;
    case SCRIPT_MANDAIC:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mid");     break;
    case SCRIPT_MANICHAEAN:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"xmn");     break;
    case SCRIPT_MARCHEN:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bo");      break;
    case SCRIPT_MASARAM_GONDI:       FcPatternAddString(pattern, FC_LANG, (FcChar8*)"gon");     break;
    case SCRIPT_MEDEFAIDRIN:         FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mfe");     break;
    case SCRIPT_MEETEI_MAYEK:        FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mni");     break;
    case SCRIPT_MENDE_KIKAKUI:       FcPatternAddString(pattern, FC_LANG, (FcChar8*)"men");     break;
    case SCRIPT_MEROITIC_CURSIVE:
    case SCRIPT_MEROITIC_HIEROGLYPHS: FcPatternAddString(pattern, FC_LANG, (FcChar8*)"xmr");   break;
    case SCRIPT_MIAO:                FcPatternAddString(pattern, FC_LANG, (FcChar8*)"hmd");     break;
    case SCRIPT_MODI:                FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mr");      break;
    case SCRIPT_MONGOLIAN:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mn");      break;
    case SCRIPT_MRO:                 FcPatternAddString(pattern, FC_LANG, (FcChar8*)"cmr");     break;
    case SCRIPT_MULTANI:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"skr");     break;
    case SCRIPT_MYANMAR:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"my");      break;
    case SCRIPT_NABATAEAN:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"arc");     break;
    case SCRIPT_NAG_MUNDARI:         FcPatternAddString(pattern, FC_LANG, (FcChar8*)"unr");     break;
    case SCRIPT_NANDINAGARI:         FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sa");      break;
    case SCRIPT_NEW_TAI_LUE:         FcPatternAddString(pattern, FC_LANG, (FcChar8*)"khb");     break;
    case SCRIPT_NEWA:                FcPatternAddString(pattern, FC_LANG, (FcChar8*)"new");     break;
    case SCRIPT_NKO:                 FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bm");      break;
    case SCRIPT_NUSHU:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"zhx-nushu"); break;
    case SCRIPT_NYIAKENG_PUACHUE_HMONG: FcPatternAddString(pattern, FC_LANG, (FcChar8*)"hnj"); break;
    case SCRIPT_OGHAM:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sga");     break;
    case SCRIPT_OL_CHIKI:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sat");     break;
    case SCRIPT_OL_ONAL:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"unx");     break;
    case SCRIPT_OLD_HUNGARIAN:       FcPatternAddString(pattern, FC_LANG, (FcChar8*)"hu");      break;
    case SCRIPT_OLD_ITALIC:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ett");     break;
    case SCRIPT_OLD_NORTH_ARABIAN:   FcPatternAddString(pattern, FC_LANG, (FcChar8*)"xna");     break;
    case SCRIPT_OLD_PERMIC:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"koi");     break;
    case SCRIPT_OLD_PERSIAN:         FcPatternAddString(pattern, FC_LANG, (FcChar8*)"peo");     break;
    case SCRIPT_OLD_SOGDIAN:
    case SCRIPT_SOGDIAN:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sog");     break;
    case SCRIPT_OLD_SOUTH_ARABIAN:   FcPatternAddString(pattern, FC_LANG, (FcChar8*)"xsa");     break;
    case SCRIPT_OLD_TURKIC:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"otk");     break;
    case SCRIPT_OLD_UYGHUR:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"oui");     break;
    case SCRIPT_ORIYA:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"or");      break;
    case SCRIPT_OSAGE:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"osa");     break;
    case SCRIPT_OSMANYA:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"so");      break;
    case SCRIPT_PAHAWH_HMONG:        FcPatternAddString(pattern, FC_LANG, (FcChar8*)"hmn");     break;
    case SCRIPT_PALMYRENE:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"arc");     break;
    case SCRIPT_PAU_CIN_HAU:         FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ctd");     break;
    case SCRIPT_PHAGS_PA:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mn");      break;
    case SCRIPT_PHOENICIAN:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"phn");     break;
    case SCRIPT_PSALTER_PAHLAVI:     FcPatternAddString(pattern, FC_LANG, (FcChar8*)"pal");     break;
    case SCRIPT_REJANG:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"rej");     break;
    case SCRIPT_RUNIC:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"non");     break;
    case SCRIPT_SAMARITAN:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"smp");     break;
    case SCRIPT_SAURASHTRA:          FcPatternAddString(pattern, FC_LANG, (FcChar8*)"saz");     break;
    case SCRIPT_SHARADA:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sa");      break;
    case SCRIPT_SHAVIAN:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"en");      break;
    case SCRIPT_SIDDHAM:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sa");      break;
    case SCRIPT_SIGNWRITING:         FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ase");     break;
    case SCRIPT_SINHALA:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"si");      break;
    case SCRIPT_SORA_SOMPENG:        FcPatternAddString(pattern, FC_LANG, (FcChar8*)"srb");     break;
    case SCRIPT_SOYOMBO:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mn");      break;
    case SCRIPT_SUNDANESE:           FcPatternAddString(pattern, FC_LANG, (FcChar8*)"su");      break;
    case SCRIPT_SUNUWAR:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"suz");     break;
    case SCRIPT_SYLOTI_NAGRI:        FcPatternAddString(pattern, FC_LANG, (FcChar8*)"syl");     break;
    case SCRIPT_SYRIAC:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"syr");     break;
    case SCRIPT_TAGALOG:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"fil");     break;
    case SCRIPT_TAGBANWA:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"tbw");     break;
    case SCRIPT_TAI_LE:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"tdd");     break;
    case SCRIPT_TAI_THAM:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"nod");     break;
    case SCRIPT_TAI_VIET:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"blt");     break;
    case SCRIPT_TAKRI:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"doi");     break;
    case SCRIPT_TAMIL:               FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ta");      break;
    case SCRIPT_TANGSA:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"nst");     break;
    case SCRIPT_TANGUT:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"txg");     break;
    case SCRIPT_TELUGU:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"te");      break;
    case SCRIPT_THAANA:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"dv");      break;
    case SCRIPT_THAI:                FcPatternAddString(pattern, FC_LANG, (FcChar8*)"th");      break;
    case SCRIPT_TIBETAN:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"bo");      break;
    case SCRIPT_TIFINAGH:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"tzm");     break;
    case SCRIPT_TIRHUTA:             FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mai");     break;
    case SCRIPT_TODHRI:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sq");      break;
    case SCRIPT_TOTO:                FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ttr");     break;
    case SCRIPT_TULU_TIGALARI:       FcPatternAddString(pattern, FC_LANG, (FcChar8*)"tcy");     break;
    case SCRIPT_UGARITIC:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"uga");     break;
    case SCRIPT_VAI:                 FcPatternAddString(pattern, FC_LANG, (FcChar8*)"vai");     break;
    case SCRIPT_VITHKUQI:            FcPatternAddString(pattern, FC_LANG, (FcChar8*)"sq");      break;
    case SCRIPT_WANCHO:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"nnp");     break;
    case SCRIPT_WARANG_CITI:         FcPatternAddString(pattern, FC_LANG, (FcChar8*)"hoc");     break;
    case SCRIPT_YEZIDI:              FcPatternAddString(pattern, FC_LANG, (FcChar8*)"kmr");     break;
    case SCRIPT_YI:                  FcPatternAddString(pattern, FC_LANG, (FcChar8*)"ii");      break;
    case SCRIPT_ZANABAZAR_SQUARE:    FcPatternAddString(pattern, FC_LANG, (FcChar8*)"mn");      break;

    case SCRIPT_NONE:
    case SCRIPT_COMMON:
    case SCRIPT_INHERITED:
    break;
  }

  FcConfigSubstitute(nullptr, pattern, FcMatchPattern);
  FcDefaultSubstitute(pattern);
  FcResult result;
  FcFontSet* set = FcFontSort(nullptr, pattern, FcFalse, nullptr, &result);

  if (set) {
    for (int i = 0; i < set->nfont && families.size() < 3 /* arbitrary max */; i++) {
      FcPattern* font = set->fonts[i];
      uint32_t canonicalIndex = get_name_index(font, FC_FAMILYLANG);
      FcChar8* canonical = nullptr;
      FcPatternGetString(font, FC_FAMILY, canonicalIndex, &canonical);
      if (canonical) {
        std::string add = (char*)canonical;
        for (std::string& existing : families) {
          if (add == existing) goto outer;
        }
        families.push_back(add);
      }
outer:
    }
  }

  // always add emoji and symbol fonts
  families.push_back("Noto Color Emoji");
  families.push_back("DejaVu Sans");
  families.push_back("Noto Sans Symbols");

  FcPatternDestroy(pattern);
}

std::optional<const std::vector<std::string>>
FontManagerLinux::getGenericList(const std::string& generic) {
  if (
    generic == "serif" ||
    generic == "sans-serif" ||
    generic == "monospace" ||
    generic == "cursive" ||
    generic == "fantasy"
  ) {
    std::vector<std::string> ret;

    FcPattern* pattern = FcPatternCreate();
    FcConfigSubstitute(nullptr, pattern, FcMatchPattern);
    FcDefaultSubstitute(pattern);
    FcResult result;
    FcFontSet* set = FcFontSort(nullptr, pattern, FcFalse, nullptr, &result);

    if (set) {
      for (int i = 0; i < set->nfont && ret.size() < 2 /* arbitrary max */; i++) {
        FcPattern* pattern = set->fonts[i];
        uint32_t canonicalIndex = get_name_index(pattern, FC_FAMILYLANG);
        FcChar8* canonical = nullptr;
        FcPatternGetString(pattern, FC_FAMILY, canonicalIndex, &canonical);

        if (canonical) {
          std::string add = (char*)canonical;
          for (std::string& existing : ret) {
            if (add == existing) goto outer;
          }
          ret.push_back(add);
        }
outer:
      }
    }

    FcPatternDestroy(pattern);

    return ret;
  }

  return std::nullopt;
}

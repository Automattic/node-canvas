// Copyright (c) 2025 Caleb Hearon <caleb@chearon.net>
//
// References:
// - https://searchfox.org/firefox-main/rev/e28b34ab33dbf49364999070168cbb7e11e8e5bd/gfx/thebes/gfxDWriteFontList.cpp
// - https://searchfox.org/firefox-main/rev/e28b34ab33dbf49364999070168cbb7e11e8e5bd/gfx/thebes/gfxWindowsPlatform.cpp

#include <windows.h>
#include <dwrite.h>

#include <vector>
#include <memory>
#include <cstring>
#include <cwchar>

#include "FontManagerWindows.h"
#include "Font.h"
#include "unicode.h"

// RAII helper to release a COM interface on scope exit.
template <typename T>
struct ComPtr {
  T* ptr = nullptr;
  ComPtr() = default;
  ComPtr(const ComPtr&) = delete;
  ComPtr& operator=(const ComPtr&) = delete;
  ~ComPtr() { if (ptr) ptr->Release(); }
  T** operator&() { return &ptr; }
  T* operator->() const { return ptr; }
  explicit operator bool() const { return ptr != nullptr; }
};

static std::unique_ptr<char[]>
utf16ToUtf8(const wchar_t* wstr) {
  int len = WideCharToMultiByte(CP_UTF8, 0, wstr, -1, nullptr, 0, nullptr, nullptr);
  if (len <= 0) return nullptr;

  auto buffer = std::make_unique<char[]>(len);
  WideCharToMultiByte(CP_UTF8, 0, wstr, -1, buffer.get(), len, nullptr, nullptr);
  return buffer;
}

static std::unique_ptr<char[]>
getEnUsString(IDWriteLocalizedStrings* strings) {
  UINT32 index = 0;
  BOOL exists = FALSE;
  if (FAILED(strings->FindLocaleName(L"en-US", &index, &exists)) || !exists) {
    return nullptr;
  }

  UINT32 length = 0;
  if (FAILED(strings->GetStringLength(index, &length))) return nullptr;

  auto wbuffer = std::make_unique<wchar_t[]>(length + 1);
  if (FAILED(strings->GetString(index, wbuffer.get(), length + 1))) return nullptr;

  return utf16ToUtf8(wbuffer.get());
}

static std::unique_ptr<char[]>
getFontFilePath(IDWriteFontFile* file) {
  if (!file) return nullptr;

  const void* referenceKey = nullptr;
  UINT32 referenceKeySize = 0;
  HRESULT res1 = file->GetReferenceKey(&referenceKey, &referenceKeySize);
  if (FAILED(res1)) return nullptr;

  ComPtr<IDWriteFontFileLoader> loader;
  HRESULT res2 = file->GetLoader(&loader);
  if (FAILED(res2)) return nullptr;

  ComPtr<IDWriteLocalFontFileLoader> localLoader;
  HRESULT res3 = loader->QueryInterface(
    __uuidof(IDWriteLocalFontFileLoader),
    (void**)&localLoader
  );
  if (FAILED(res3)) return nullptr;

  UINT32 pathLength = 0;
  HRESULT res4 = localLoader->GetFilePathLengthFromKey(
    referenceKey,
    referenceKeySize,
    &pathLength
  );
  if (FAILED(res4)) return nullptr;

  auto wpath = std::make_unique<wchar_t[]>(pathLength + 1);
  HRESULT res5 = localLoader->GetFilePathFromKey(
    referenceKey,
    referenceKeySize,
    wpath.get(),
    pathLength + 1
  );
  if (FAILED(res5)) return nullptr;

  return utf16ToUtf8(wpath.get());
}

static uint16_t
convertStretch(DWRITE_FONT_STRETCH stretch) {
  switch (stretch) {
    case DWRITE_FONT_STRETCH_ULTRA_CONDENSED: return 50;
    case DWRITE_FONT_STRETCH_EXTRA_CONDENSED: return 63; // 62.5
    case DWRITE_FONT_STRETCH_CONDENSED:       return 75;
    case DWRITE_FONT_STRETCH_SEMI_CONDENSED:  return 88; // 87.5
    case DWRITE_FONT_STRETCH_SEMI_EXPANDED:   return 113; // 112.5
    case DWRITE_FONT_STRETCH_EXPANDED:        return 125;
    case DWRITE_FONT_STRETCH_EXTRA_EXPANDED:  return 150;
    case DWRITE_FONT_STRETCH_ULTRA_EXPANDED:  return 200;
    case DWRITE_FONT_STRETCH_NORMAL:
    case DWRITE_FONT_STRETCH_UNDEFINED:
    default:                                  return 100;
  }
}

static FontStyle
convertStyle(DWRITE_FONT_STYLE style) {
  switch (style) {
    case DWRITE_FONT_STYLE_ITALIC:  return FontStyle::Italic;
    case DWRITE_FONT_STYLE_OBLIQUE: return FontStyle::Oblique;
    case DWRITE_FONT_STYLE_NORMAL:
    default:                        return FontStyle::Normal;
  }
}

static void
create_font_descriptor(
  std::vector<FontDescriptor>& results,
  IDWriteFont* font,
  const char* familyName
) {
  ComPtr<IDWriteFontFace> face;
  if (FAILED(font->CreateFontFace(&face))) return;

  UINT32 numberOfFiles = 1;
  if (FAILED(face->GetFiles(&numberOfFiles, nullptr))) return;
  if (numberOfFiles != 1) return;

  IDWriteFontFile* file;
  if (FAILED(face->GetFiles(&numberOfFiles, &file))) return;

  std::unique_ptr<char[]> path = getFontFilePath(file);
  file->Release();
  if (!path) return;

  FontDescriptor desc;
  desc.url = std::move(path);

  size_t familyLength = std::strlen(familyName) + 1;
  desc.family = std::make_unique<char[]>(familyLength);
  std::memcpy(desc.family.get(), familyName, familyLength);
  desc.weight = static_cast<uint16_t>(font->GetWeight());
  desc.stretch = convertStretch(font->GetStretch());
  desc.style = convertStyle(font->GetStyle());
  desc.index = face->GetIndex();

  results.push_back(std::move(desc));
}

void
FontManagerWindows::readSystemFonts() {
  ComPtr<IDWriteFactory> factory;
  HRESULT res = DWriteCreateFactory(
    DWRITE_FACTORY_TYPE_SHARED,
    __uuidof(IDWriteFactory),
    (IUnknown**)&factory
  );

  if (FAILED(res)) return;

  ComPtr<IDWriteFontCollection> collection;
  if (FAILED(factory->GetSystemFontCollection(&collection, FALSE))) return;

  UINT32 familyCount = collection->GetFontFamilyCount();

  for (UINT32 i = 0; i < familyCount; i++) {
    ComPtr<IDWriteFontFamily> family;
    if (FAILED(collection->GetFontFamily(i, &family))) continue;

    ComPtr<IDWriteLocalizedStrings> familyNames;
    if (FAILED(family->GetFamilyNames(&familyNames))) continue;

    std::unique_ptr<char[]> familyName = getEnUsString(familyNames.ptr);
    if (!familyName) continue;

    UINT32 fontCount = family->GetFontCount();
    for (UINT32 j = 0; j < fontCount; j++) {
      ComPtr<IDWriteFont> font;
      if (FAILED(family->GetFont(j, &font))) continue;
      create_font_descriptor(system_fonts, font.ptr, familyName.get());
    }
  }
}

void
FontManagerWindows::populateFallbackFonts(
  std::vector<std::string>& families,
  script_t script
) {
  // Note: this was copied from Firefox, including comments, and tweaked to fit
  switch (script) {
    case SCRIPT_COMMON:
    case SCRIPT_INHERITED:
      // In most cases, COMMON and INHERITED characters will be merged into
      // their context, but if they occur without context, we'll just treat
      // them like Latin, etc.
    case SCRIPT_LATIN:
    case SCRIPT_CYRILLIC:
    case SCRIPT_GREEK:
    case SCRIPT_ARMENIAN:
    case SCRIPT_HEBREW:
      // families.push_back("Arial");
      break;

      // CJK-related script codes are a bit troublesome because of unification;
      // we'll probably just get HAN much of the time, so the choice of which
      // language font to try for fallback is rather arbitrary. Usually, though,
      // we hope that font prefs will have handled this earlier.
    case SCRIPT_BOPOMOFO:
    case SCRIPT_HAN:
      families.push_back("SimSun");
      // We can't see the codepoint here, so always offer the ext-B font too.
      families.push_back("SimSun-ExtB");
      break;
    case SCRIPT_HIRAGANA:
    case SCRIPT_KATAKANA:
      families.push_back("Yu Gothic");
      families.push_back("MS PGothic");
      break;
    case SCRIPT_HANGUL:
      families.push_back("Malgun Gothic");
      break;

    case SCRIPT_YI:
      families.push_back("Microsoft Yi Baiti");
      break;
    case SCRIPT_MONGOLIAN:
      families.push_back("Mongolian Baiti");
      break;
    case SCRIPT_TIBETAN:
      families.push_back("Microsoft Himalaya");
      break;
    case SCRIPT_PHAGS_PA:
      families.push_back("Microsoft PhagsPa");
      break;

    case SCRIPT_ARABIC:
      // Default to Arial (added unconditionally below) for Arabic script.
      break;
    case SCRIPT_SYRIAC:
      families.push_back("Estrangelo Edessa");
      break;
    case SCRIPT_THAANA:
      families.push_back("MV Boli");
      break;

    case SCRIPT_BENGALI:
      families.push_back("Vrinda");
      families.push_back("Nirmala UI");
      break;
    case SCRIPT_DEVANAGARI:
      families.push_back("Kokila");
      families.push_back("Nirmala UI");
      break;
    case SCRIPT_GUJARATI:
      families.push_back("Shruti");
      families.push_back("Nirmala UI");
      break;
    case SCRIPT_GURMUKHI:
      families.push_back("Raavi");
      families.push_back("Nirmala UI");
      break;
    case SCRIPT_KANNADA:
      families.push_back("Tunga");
      families.push_back("Nirmala UI");
      break;
    case SCRIPT_MALAYALAM:
      families.push_back("Kartika");
      families.push_back("Nirmala UI");
      break;
    case SCRIPT_ORIYA:
      families.push_back("Kalinga");
      families.push_back("Nirmala UI");
      break;
    case SCRIPT_TAMIL:
      families.push_back("Latha");
      families.push_back("Nirmala UI");
      break;
    case SCRIPT_TELUGU:
      families.push_back("Gautami");
      families.push_back("Nirmala UI");
      break;
    case SCRIPT_SINHALA:
      families.push_back("Iskoola Pota");
      families.push_back("Nirmala UI");
      break;

    case SCRIPT_CHAKMA:
    case SCRIPT_MEETEI_MAYEK:
    case SCRIPT_OL_CHIKI:
    case SCRIPT_SORA_SOMPENG:
      families.push_back("Nirmala UI");
      break;

    case SCRIPT_MYANMAR:
      families.push_back("Myanmar Text");
      break;
    case SCRIPT_KHMER:
      families.push_back("Khmer UI");
      break;
    case SCRIPT_LAO:
      families.push_back("Lao UI");
      break;
    case SCRIPT_THAI:
      families.push_back("Tahoma");
      families.push_back("Leelawadee UI");
      break;
    case SCRIPT_TAI_LE:
      families.push_back("Microsoft Tai Le");
      break;
    case SCRIPT_BUGINESE:
      families.push_back("Leelawadee UI");
      break;
    case SCRIPT_NEW_TAI_LUE:
      families.push_back("Microsoft New Tai Lue");
      break;
    case SCRIPT_JAVANESE:
      families.push_back("Javanese Text");
      break;

    case SCRIPT_GEORGIAN:
    case SCRIPT_LISU:
      families.push_back("Segoe UI");
      break;

    case SCRIPT_ETHIOPIC:
      families.push_back("Nyala");
      families.push_back("Ebrima");
      break;

    case SCRIPT_ADLAM:
    case SCRIPT_NKO:
    case SCRIPT_OSMANYA:
    case SCRIPT_TIFINAGH:
    case SCRIPT_VAI:
      families.push_back("Ebrima");
      break;

    case SCRIPT_CANADIAN_ABORIGINAL:
      families.push_back("Euphemia");
      break;

    case SCRIPT_CHEROKEE:
    case SCRIPT_OSAGE:
      families.push_back("Gadugi");
      break;

    case SCRIPT_BRAILLE:
    case SCRIPT_DESERET:
      families.push_back("Segoe UI Symbol");
      break;

    case SCRIPT_BRAHMI:
    case SCRIPT_CARIAN:
    case SCRIPT_CUNEIFORM:
    case SCRIPT_CYPRIOT:
    case SCRIPT_EGYPTIAN_HIEROGLYPHS:
    case SCRIPT_GLAGOLITIC:
    case SCRIPT_GOTHIC:
    case SCRIPT_IMPERIAL_ARAMAIC:
    case SCRIPT_INSCRIPTIONAL_PAHLAVI:
    case SCRIPT_INSCRIPTIONAL_PARTHIAN:
    case SCRIPT_KHAROSHTHI:
    case SCRIPT_LYCIAN:
    case SCRIPT_LYDIAN:
    case SCRIPT_MEROITIC_CURSIVE:
    case SCRIPT_OGHAM:
    case SCRIPT_OLD_ITALIC:
    case SCRIPT_OLD_PERSIAN:
    case SCRIPT_OLD_SOUTH_ARABIAN:
    case SCRIPT_OLD_TURKIC:
    case SCRIPT_PHOENICIAN:
    case SCRIPT_RUNIC:
    case SCRIPT_SHAVIAN:
    case SCRIPT_UGARITIC:
      families.push_back("Segoe UI Historic");
      break;

      // For some scripts where Windows doesn't supply a font by default,
      // there are Noto fonts that users might have installed:
    case SCRIPT_AHOM:
      families.push_back("Noto Serif Ahom");
      break;
    case SCRIPT_AVESTAN:
      families.push_back("Noto Sans Avestan");
      break;
    case SCRIPT_BALINESE:
      families.push_back("Noto Sans Balinese");
      break;
    case SCRIPT_BAMUM:
      families.push_back("Noto Sans Bamum");
      break;
    case SCRIPT_BASSA_VAH:
      families.push_back("Noto Sans Bassa Vah");
      break;
    case SCRIPT_BATAK:
      families.push_back("Noto Sans Batak");
      break;
    case SCRIPT_BHAIKSUKI:
      families.push_back("Noto Sans Bhaiksuki");
      break;
    case SCRIPT_BUHID:
      families.push_back("Noto Sans Buhid");
      break;
    case SCRIPT_CAUCASIAN_ALBANIAN:
      families.push_back("Noto Sans Caucasian Albanian");
      break;
    case SCRIPT_CHAM:
      families.push_back("Noto Sans Cham");
      break;
    case SCRIPT_COPTIC:
      families.push_back("Noto Sans Coptic");
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
    case SCRIPT_HANIFI_ROHINGYA:
      families.push_back("Noto Sans Hanifi Rohingya");
      break;
    case SCRIPT_HANUNOO:
      families.push_back("Noto Sans Hanunoo");
      break;
    case SCRIPT_HATRAN:
      families.push_back("Noto Sans Hatran");
      break;
    case SCRIPT_KAITHI:
      families.push_back("Noto Sans Kaithi");
      break;
    case SCRIPT_KAYAH_LI:
      families.push_back("Noto Sans Kayah Li");
      break;
    case SCRIPT_KHOJKI:
      families.push_back("Noto Sans Khojki");
      break;
    case SCRIPT_KHUDAWADI:
      families.push_back("Noto Sans Khudawadi");
      break;
    case SCRIPT_LEPCHA:
      families.push_back("Noto Sans Lepcha");
      break;
    case SCRIPT_LIMBU:
      families.push_back("Noto Sans Limbu");
      break;
    case SCRIPT_LINEAR_A:
      families.push_back("Noto Sans Linear A");
      break;
    case SCRIPT_LINEAR_B:
      families.push_back("Noto Sans Linear B");
      break;
    case SCRIPT_MAHAJANI:
      families.push_back("Noto Sans Mahajani");
      break;
    case SCRIPT_MANDAIC:
      families.push_back("Noto Sans Mandaic");
      break;
    case SCRIPT_MANICHAEAN:
      families.push_back("Noto Sans Manichaean");
      break;
    case SCRIPT_MARCHEN:
      families.push_back("Noto Sans Marchen");
      break;
    case SCRIPT_MENDE_KIKAKUI:
      families.push_back("Noto Sans Mende Kikakui");
      break;
    case SCRIPT_MEROITIC_HIEROGLYPHS:
      families.push_back("Noto Sans Meroitic");
      break;
    case SCRIPT_MIAO:
      families.push_back("Noto Sans Miao");
      break;
    case SCRIPT_MODI:
      families.push_back("Noto Sans Modi");
      break;
    case SCRIPT_MRO:
      families.push_back("Noto Sans Mro");
      break;
    case SCRIPT_MULTANI:
      families.push_back("Noto Sans Multani");
      break;
    case SCRIPT_NABATAEAN:
      families.push_back("Noto Sans Nabataean");
      break;
    case SCRIPT_NEWA:
      families.push_back("Noto Sans Newa");
      break;
    case SCRIPT_OLD_HUNGARIAN:
      families.push_back("Noto Sans Old Hungarian");
      break;
    case SCRIPT_OLD_NORTH_ARABIAN:
      families.push_back("Noto Sans Old North Arabian");
      break;
    case SCRIPT_OLD_PERMIC:
      families.push_back("Noto Sans Old Permic");
      break;
    case SCRIPT_PAHAWH_HMONG:
      families.push_back("Noto Sans Pahawh Hmong");
      break;
    case SCRIPT_PALMYRENE:
      families.push_back("Noto Sans Palmyrene");
      break;
    case SCRIPT_PAU_CIN_HAU:
      families.push_back("Noto Sans Pau Cin Hau");
      break;
    case SCRIPT_PSALTER_PAHLAVI:
      families.push_back("Noto Sans Psalter Pahlavi");
      break;
    case SCRIPT_REJANG:
      families.push_back("Noto Sans Rejang");
      break;
    case SCRIPT_SAMARITAN:
      families.push_back("Noto Sans Samaritan");
      break;
    case SCRIPT_SAURASHTRA:
      families.push_back("Noto Sans Saurashtra");
      break;
    case SCRIPT_SHARADA:
      families.push_back("Noto Sans Sharada");
      break;
    case SCRIPT_SIDDHAM:
      families.push_back("Noto Sans Siddham");
      break;
    case SCRIPT_SUNDANESE:
      families.push_back("Noto Sans Sundanese");
      break;
    case SCRIPT_SYLOTI_NAGRI:
      families.push_back("Noto Sans Syloti Nagri");
      break;
    case SCRIPT_TAGALOG:
      families.push_back("Noto Sans Tagalog");
      break;
    case SCRIPT_TAGBANWA:
      families.push_back("Noto Sans Tagbanwa");
      break;
    case SCRIPT_TAI_THAM:
      families.push_back("Noto Sans Tai Tham");
      break;
    case SCRIPT_TAI_VIET:
      families.push_back("Noto Sans Tai Viet");
      break;
    case SCRIPT_TAKRI:
      families.push_back("Noto Sans Takri");
      break;
    case SCRIPT_TIRHUTA:
      families.push_back("Noto Sans Tirhuta");
      break;
    case SCRIPT_WANCHO:
      families.push_back("Noto Sans Wancho");
      break;
    case SCRIPT_WARANG_CITI:
      families.push_back("Noto Sans Warang Citi");
      break;

    case SCRIPT_NONE:
    case SCRIPT_ANATOLIAN_HIEROGLYPHS:
    case SCRIPT_CHORASMIAN:
    case SCRIPT_CYPRO_MINOAN:
    case SCRIPT_DIVES_AKURU:
    case SCRIPT_DOGRA:
    case SCRIPT_ELYMAIC:
    case SCRIPT_GARAY:
    case SCRIPT_GUNJALA_GONDI:
    case SCRIPT_GURUNG_KHEMA:
    case SCRIPT_KAWI:
    case SCRIPT_KHITAN_SMALL_SCRIPT:
    case SCRIPT_KIRAT_RAI:
    case SCRIPT_MAKASAR:
    case SCRIPT_MASARAM_GONDI:
    case SCRIPT_MEDEFAIDRIN:
    case SCRIPT_NAG_MUNDARI:
    case SCRIPT_NANDINAGARI:
    case SCRIPT_NUSHU:
    case SCRIPT_NYIAKENG_PUACHUE_HMONG:
    case SCRIPT_OL_ONAL:
    case SCRIPT_OLD_SOGDIAN:
    case SCRIPT_OLD_UYGHUR:
    case SCRIPT_SIGNWRITING:
    case SCRIPT_SOGDIAN:
    case SCRIPT_SOYOMBO:
    case SCRIPT_SUNUWAR:
    case SCRIPT_TANGSA:
    case SCRIPT_TANGUT:
    case SCRIPT_TODHRI:
    case SCRIPT_TOTO:
    case SCRIPT_TULU_TIGALARI:
    case SCRIPT_VITHKUQI:
    case SCRIPT_YEZIDI:
    case SCRIPT_ZANABAZAR_SQUARE:
      break;
  }

  // Arial is used as default fallback for system fallback, so always try that.
  families.push_back("Arial");

  // TODO: Color Emoji should depend on if the default presentation for the
  // codepoint is color or if a VS16 selector is present. For now we always
  // prefer it (Firefox's PrefersColor() path).
  families.push_back("Segoe UI Emoji");
  families.push_back("Twemoji Mozilla");

  // Symbols/dingbats are generally Script=COMMON but may be resolved to any
  // surrounding script run. So we'll always append a couple of likely fonts
  // for such characters. (Firefox gates these on the codepoint, which we don't
  // thread through here, so we add them unconditionally.)
  families.push_back("Segoe UI");
  families.push_back("Segoe UI Symbol");
  families.push_back("Cambria Math");

  // Arial Unicode MS also has lots of glyphs for obscure characters; try it as
  // a last resort, if available.
  families.push_back("Arial Unicode MS");
}

// See the preferences font.name-list.*.x-western in Firefox (Windows values).
const std::vector<std::string> serif_fonts = {"Times New Roman"};
const std::vector<std::string> sans_serif_fonts = {"Arial"};
const std::vector<std::string> monospace_fonts = {"Consolas"};
const std::vector<std::string> cursive_fonts = {"Comic Sans MS"};

std::optional<const std::vector<std::string>*>
FontManagerWindows::getGenericList(const std::string& generic) {
  if (generic == "serif") {
    return &serif_fonts;
  } else if (generic == "sans-serif") {
    return &sans_serif_fonts;
  } else if (generic == "monospace") {
    return &monospace_fonts;
  } else if (generic == "cursive") {
    return &cursive_fonts;
  } else { // Firefox doesn't list any Fantasy fonts for Windows
    return std::nullopt;
  }
}

// Copyright (c) 2024 Caleb Hearon <caleb@chearon.net>
// Stuff common to all perspectives on fonts: CSS, OS fonts, querying, etc.
#pragma once

#include <string>
#include <vector>
#include <cstdio>

#include <hb.h>
#include <hb-ot.h>

enum class FontStyle {
  Normal,
  Italic,
  Oblique
};

enum class FontVariant {
  Normal,
  SmallCaps
};

enum class FontStatus { Unloaded, Loaded, Error };

#ifdef _WIN32
using file_char = wchar_t;
#else
using file_char = char;
#endif

// Descriptors and properties (see next comments)
struct FontBase {
  uint16_t weight{400};
  FontVariant variant{FontVariant::Normal};
  FontStyle style{FontStyle::Normal};
  uint16_t stretch{100};
};

struct HbFontDeleter {
  void operator()(hb_font_t* font) {
    hb_font_destroy(font);
  }
};

// Descriptors describe real fonts on the OS
struct FontDescriptor : FontBase {
  std::unique_ptr<char[]> family;
  // The postscript name is kept purely to select fonts within a TrueType
  // Collection (ttc). macOS CTFontDescriptors don't tell you which index
  // they represent in a ttc, so when we begin to draw with a ttc match, we
  // select which index to draw with based on which one has this name.
  std::unique_ptr<char[]> postscript = nullptr;
  std::unique_ptr<file_char[]> url = nullptr;
  std::unique_ptr<uint8_t[]> data = nullptr;
  std::unique_ptr<hb_font_t, HbFontDeleter> hbfont = nullptr;
  size_t data_len = 0;
  size_t index = 0;
  FontStatus status = FontStatus::Unloaded;

  void loadHbFont() {
    // create the HarfBuzz font
    hb_blob_t* hbblob = hb_blob_create(
      reinterpret_cast<const char *>(data.get()),
      data_len,
      HB_MEMORY_MODE_READONLY,
      nullptr,
      nullptr
    );
    size_t count = hb_face_count(hbblob);
    if (count > 1 && postscript) {
      // Lazily initialize the ttc index for backends that don't provide it (macOS)
      for (size_t index = 0; index < count; index++) {
        char buf[128];
        unsigned int len = sizeof(buf);
        hb_face_t* hbface = hb_face_create(hbblob, index);
        hb_ot_name_get_utf8(
          hbface,
          HB_OT_NAME_ID_POSTSCRIPT_NAME,
          hb_language_from_string("en", -1),
          &len,
          buf
        );
        hb_face_destroy(hbface);

        if (strcmp(buf, postscript.get()) == 0) {
          this->index = index;
          break;
        }
      }
    }
    hb_face_t* hbface = hb_face_create(hbblob, index);
    hb_blob_destroy(hbblob);
    hbfont = std::unique_ptr<hb_font_t, HbFontDeleter>(hb_font_create(hbface));
    hb_face_destroy(hbface);
    hb_font_set_scale(hbfont.get(), 1000, 1000);
  }

  void loadData() {
    FILE* file = nullptr;
    long file_size = 0;
    std::unique_ptr<uint8_t[]> buffer;

    // TODO: propagate error
#ifdef _WIN32
    file = _wfopen(url.get(), L"rb");
#else
    file = fopen(url.get(), "rb");
#endif
    if (!file) goto bail;

    // TODO: propagate error
    if (fseek(file, 0, SEEK_END) != 0) goto bail;

    // TODO: propagate error
    file_size = ftell(file);
    if (file_size < 0) goto bail;

    // TODO: propagate error
    if (fseek(file, 0, SEEK_SET) != 0) goto bail;

    buffer = std::make_unique<uint8_t[]>(file_size);
    if (fread(buffer.get(), 1, file_size, file) != static_cast<size_t>(file_size)) {
      goto bail;
    }

    data = std::move(buffer);
    data_len = file_size;
    status = FontStatus::Loaded;
    fclose(file);
    return;

bail:
    status = FontStatus::Error;
    if (file) fclose(file);
  }

  void load() {
    if (status == FontStatus::Unloaded) loadData();
    if (status == FontStatus::Loaded && hbfont == nullptr) loadHbFont();
  }
};

// Properties describe desired fonts from CSS/ctx.font
struct FontProperties : FontBase {
  std::vector<std::string> families;
  double size{10.0f};
};

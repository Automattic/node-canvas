// Copyright (c) 2024 Caleb Hearon <caleb@chearon.net>
// Stuff common to all perspectives on fonts: CSS, OS fonts, querying, etc.
#pragma once

#include <string>
#include <vector>
#include <cstdio>

enum class FontStyle {
  Normal,
  Italic,
  Oblique
};

enum class FontVariant {
  Normal,
  SmallCaps
};

// Descriptors and properties (see next comments)
struct FontBase {
  uint16_t weight{400};
  FontVariant variant{FontVariant::Normal};
  FontStyle style{FontStyle::Normal};
  uint16_t stretch{100};
};

// Descriptors describe real fonts on the OS
struct FontDescriptor : FontBase {
  std::unique_ptr<char[]> family;
  // The postscript name is kept purely to select fonts within a TrueType
  // Collection (ttc). macOS CTFontDescriptors don't tell you which index
  // they represent in a ttc, so when we begin to draw with a ttc match, we
  // select which index to draw with based on which one has this name.
  std::unique_ptr<char[]> postscript = nullptr;
  std::unique_ptr<char[]> url = nullptr;
  std::unique_ptr<uint8_t[]> data = nullptr;
  size_t data_len = 0;
  size_t index = 0;

  void load() {
    if (data != nullptr || url == nullptr) return;

    FILE* file = nullptr;
    long file_size = 0;
    std::unique_ptr<uint8_t[]> buffer;

    // TODO: propagate error
    file = fopen(url.get(), "rb");
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

bail:
    if (file) fclose(file);
  }
};

// Properties describe desired fonts from CSS/ctx.font
struct FontProperties : FontBase {
  std::vector<std::string> families;
  double size{16.0f};
};

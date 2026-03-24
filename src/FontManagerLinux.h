// Copyright (c) 2025 Caleb Hearon <caleb@chearon.net>

#pragma once

#include "FontManager.h"

class FontManagerLinux : public FontManager {
  public:
    void readSystemFonts(std::vector<FontDescriptor>& properties) override;
    void populateFallbackFonts(std::vector<std::string>& families, script_t script) override;
    std::optional<const std::vector<std::string>> getGenericList(const std::string& generic) override;
};

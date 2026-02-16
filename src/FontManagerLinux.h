#pragma once

#include "FontManager.h"
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

class FontManagerLinux : public FontManager {
  public:
    void readSystemFonts() override;
    void populateFallbackFonts(std::vector<std::string>& families, script_t script) override;
    std::optional<const std::vector<std::string>*> getGenericList(const std::string& generic) override;

  private:
    std::vector<std::string> emoji_fonts;
    std::vector<std::string> symbol_fonts;

    std::unordered_map<std::string, std::vector<std::string>> generic_fonts;
    std::unordered_map<std::string, std::vector<std::string>> lang_cache;
    const std::vector<std::string>& langFamilies(const std::string& lang);
};

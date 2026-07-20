#pragma once

#include <cctype>

#define LOG_LEVEL 0

#if LOG_LEVEL > 0
#include <iostream>
#define LOG(fmt, ...) printf(fmt, ##__VA_ARGS__)
#else
#define LOG(fmt, ...)
#endif

inline bool streq_casein(std::string& str1, std::string& str2) {
  return str1.size() == str2.size() && std::equal(str1.begin(), str1.end(), str2.begin(), [](char& c1, char& c2) {
    return c1 == c2 || std::toupper(c1) == std::toupper(c2);
  });
}

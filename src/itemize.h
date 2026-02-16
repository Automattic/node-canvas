#pragma once

#include <vector>
#include <cstdint>
#include <SheenBidi/SheenBidi.h>
#include "unicode.h"

struct ParenInfo {
  int index;
  script_t script;
};

struct ScriptIteratorState {
  // Output
  size_t offset = 0;
  script_t script = SCRIPT_COMMON;
  bool done = false;
  
  // Private state
  std::vector<ParenInfo> parens;
  int start_paren = -1;
};

struct BidiIteratorState {
  BidiIteratorState(
    char16_t* textBuffer,
    size_t textLength,
    uint8_t initialLevel
  ) {
    SBCodepointSequence codepointSequence = {
      SBStringEncodingUTF16,
      textBuffer,
      textLength
    };
    algorithm = SBAlgorithmCreate(&codepointSequence);
    paragraph = SBAlgorithmCreateParagraph(
      algorithm,
      offset,
      textLength,
      initialLevel
    );
    levels = SBParagraphGetLevelsPtr(paragraph);
  }
  
  ~BidiIteratorState() {
    if (paragraph != nullptr) SBParagraphRelease(paragraph);
    if (algorithm != nullptr) SBAlgorithmRelease(algorithm);
  }
    
  // Output
  size_t offset = 0;
  uint8_t level = 0;
  bool done = false;
  
  // Private state
  SBAlgorithmRef algorithm = nullptr;
  SBParagraphRef paragraph = nullptr;
  const SBLevel* levels = nullptr;
};

struct ItemizeState {
  ItemizeState(
    char16_t* textBuffer,
    size_t textLength,
    uint8_t initialLevel
  ) : textBuffer(textBuffer)
    , textLength(textLength)
    , bidi_state(textBuffer, textLength, initialLevel) {}

  // Output
  size_t offset = 0;
  bool done = false;
  
  // Private state
  char16_t* textBuffer;
  size_t textLength;
  BidiIteratorState bidi_state;
  ScriptIteratorState script_state;
};

void itemizeNext(ItemizeState& state);

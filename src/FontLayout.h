// Copyright (c) 2024 Caleb Hearon <caleb@chearon.net>

#pragma once

#include <vector>
#include <hb.h>
#include <hb-ot.h>

#include "InstanceData.h"
#include "Font.h"
#include "FontFaceSet.h"
#include "itemize.h"
#include "Canvas.h"
#include "CanvasRenderingContext2d.h"

struct canvas_state_t;

struct ShapeWork {
  size_t start;
  size_t end;
};

struct Segment {
  size_t textStart;
  size_t textEnd;
  size_t glyphStart;
  size_t glyphEnd;
  bool needsReshape;
};

struct Glyph {
  hb_codepoint_t id;
  uint32_t cluster;
  hb_position_t  x_advance;
  hb_position_t  y_advance;
  hb_position_t  x_offset;
  hb_position_t  y_offset;
  hb_position_t x_bearing;
  hb_position_t y_bearing;
  hb_position_t width;
  hb_position_t height;
};

struct GlyphRun {
  const FontDescriptor* face;
  std::vector<Glyph> glyphs;
  size_t start;
  size_t end;
  uint8_t level;
};

struct FontMetrics {
  double ascender;
  double descender;
  double central;
  double ideographic;
  double hanging;
};

bool
compareGlyphRunTextPosition(const GlyphRun& a, const GlyphRun& b);

text_align_t
resolveTextAlignment(canvas_state_t* state);

void
flushSegment(
  Segment& segment,
  std::vector<ShapeWork>& shapingWorkList,
  std::vector<GlyphRun>& line,
  uint8_t level,
  const FontDescriptor* face,
  hb_font_t* hbfont,
  hb_buffer_t* buffer,
  bool isLastMatch
);

struct TextLayout {
  std::vector<GlyphRun> runs;
  // Increasing values move from the first glyph to the right (always positive)
  double anchorX;
  // Increasing values move from the baseline up (can be negative)
  double anchorY;
  FontMetrics metrics{0, 0, 0, 0, 0};
  double width;
};

TextLayout
layoutText(
  char16_t* textBuffer,
  size_t textLength,
  canvas_state_t* state,
  InstanceData* data
);

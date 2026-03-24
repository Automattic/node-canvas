// Copyright (c) 2024 Caleb Hearon <caleb@chearon.net>

#include <algorithm>

#include "FontLayout.h"
#include "Util.h"

// Gets a code point from a UTF-16 string
// handling surrogate pairs appropriately
uint32_t
codePointAt(char16_t* str, size_t len, size_t* idx) {
  uint16_t hi, low;
  uint16_t code = str[(*idx)++];

  // High surrogate
  if (0xd800 <= code && code <= 0xdbff) {
    hi = code;
    if (*idx < len) {
      low = str[(*idx)++];
      if (0xdc00 <= low && low <= 0xdfff) {
        return ((hi - 0xd800) * 0x400) + (low - 0xdc00) + 0x10000;
      }
    }
    return hi;
  }

  return code;
}

bool
compareGlyphRunTextPosition(const GlyphRun& a, const GlyphRun& b) {
  return a.start < b.start;
}

/*
 * Gets the baseline adjustment in device pixels
 */
double getBaselineAdjustment(text_baseline_t baseline, FontMetrics metrics, double fontSize) {
  switch (baseline) {
  case TEXT_BASELINE_ALPHABETIC:
    return 0;
  case TEXT_BASELINE_TOP:
    return metrics.central + fontSize / 2;
  case TEXT_BASELINE_MIDDLE:
    return metrics.central;
  case TEXT_BASELINE_BOTTOM:
    return metrics.central - fontSize / 2;
  case TEXT_BASELINE_IDEOGRAPHIC:
    return metrics.ideographic;
  case TEXT_BASELINE_HANGING:
    return metrics.hanging;
  }
}

text_align_t
resolveTextAlignment(canvas_state_t* state) {
  text_align_t alignment = state->textAlignment;

  // Convert start/end to left/right based on direction
  if (alignment == TEXT_ALIGNMENT_START) {
    return (state->direction == "rtl") ? TEXT_ALIGNMENT_RIGHT : TEXT_ALIGNMENT_LEFT;
  } else if (alignment == TEXT_ALIGNMENT_END) {
    return (state->direction == "rtl") ? TEXT_ALIGNMENT_LEFT : TEXT_ALIGNMENT_RIGHT;
  }

  return alignment;
}

void
flushSegment(
  Segment& segment,
  std::vector<ShapeWork>& shapingWorkList,
  std::vector<GlyphRun>& runs,
  uint8_t level,
  const FontDescriptor* face,
  hb_font_t* hbfont,
  hb_buffer_t* buffer,
  bool isLastMatch
) {
  if (segment.needsReshape && !isLastMatch) {
    LOG("==> %zu..%zu needs reshape\n", segment.textStart, segment.textEnd - 1);
    shapingWorkList.push_back(ShapeWork{segment.textStart, segment.textEnd});
  } else {
    // copy the glyphs and add to the line, yay!
    GlyphRun run;
    hb_glyph_extents_t extents;

    run.face = face;
    run.glyphs.resize(segment.glyphEnd - segment.glyphStart);
    run.start = segment.textStart;
    run.end = segment.textEnd;
    run.level = level;

    hb_glyph_position_t* glyphPositions = hb_buffer_get_glyph_positions(buffer, nullptr);
    hb_glyph_info_t* glyphInfos = hb_buffer_get_glyph_infos(buffer, nullptr);

    if (segment.needsReshape) {
      LOG("==> %zu..%zu finished with tofu :(\n", segment.textStart, segment.textEnd - 1);
    } else {
      LOG("==> %zu..%zu success!\n", segment.textStart, segment.textEnd - 1);
    }

    if (level & 1) {
      int r = segment.glyphEnd - 1;
      size_t w = 0;
      for (int end = segment.glyphStart - 1; r > end; r--, w++) {
        hb_font_get_glyph_extents(hbfont, glyphInfos[r].codepoint, &extents);
        run.glyphs[w].id = glyphInfos[r].codepoint;
        run.glyphs[w].cluster = glyphInfos[r].cluster;
        run.glyphs[w].x_advance = glyphPositions[r].x_advance;
        run.glyphs[w].y_advance = glyphPositions[r].y_advance;
        run.glyphs[w].x_offset = glyphPositions[r].x_offset;
        run.glyphs[w].y_offset = glyphPositions[r].y_offset;
        run.glyphs[w].x_bearing = extents.x_bearing;
        run.glyphs[w].y_bearing = extents.y_bearing;
        run.glyphs[w].width = extents.width;
        run.glyphs[w].height = extents.height;
      }
    } else {
      size_t r = segment.glyphStart;
      size_t w = 0;
      for (; r < segment.glyphEnd; r++, w++) {
        hb_font_get_glyph_extents(hbfont, glyphInfos[r].codepoint, &extents);
        run.glyphs[w].id = glyphInfos[r].codepoint;
        run.glyphs[w].cluster = glyphInfos[r].cluster;
        run.glyphs[w].x_advance = glyphPositions[r].x_advance;
        run.glyphs[w].y_advance = glyphPositions[r].y_advance;
        run.glyphs[w].x_offset = glyphPositions[r].x_offset;
        run.glyphs[w].y_offset = glyphPositions[r].y_offset;
        run.glyphs[w].x_bearing = extents.x_bearing;
        run.glyphs[w].y_bearing = extents.y_bearing;
        run.glyphs[w].width = extents.width;
        run.glyphs[w].height = extents.height;
      }
    }

    runs.push_back(run);
  }
}

static void
extractMetrics(
  hb_font_t* hbfont,
  double fontSize,
  uint8_t level,
  FontMetrics* metrics
) {
  // ascender
  hb_position_t ascender;
  hb_ot_metrics_get_position_with_fallback(
    hbfont,
    HB_OT_METRICS_TAG_HORIZONTAL_ASCENDER,
    &ascender
  );
  metrics->ascender = ascender * fontSize / 1000;

  // descender
  hb_position_t descender;
  hb_ot_metrics_get_position_with_fallback(
    hbfont,
    HB_OT_METRICS_TAG_HORIZONTAL_DESCENDER,
    &descender
  );
  metrics->descender = descender * fontSize / 1000;

  // Idce
  hb_position_t Idce;
  bool hasIdce = hb_ot_layout_get_baseline(
    hbfont,
    HB_OT_LAYOUT_BASELINE_TAG_IDEO_EMBOX_CENTRAL,
    level & 1 ? HB_DIRECTION_RTL : HB_DIRECTION_LTR,
    HB_OT_TAG_DEFAULT_SCRIPT,
    HB_OT_TAG_DEFAULT_LANGUAGE,
    &Idce
  );

  // ideo
  hb_position_t ideo;
  bool hasIdeo = hb_ot_layout_get_baseline(
    hbfont,
    HB_OT_LAYOUT_BASELINE_TAG_IDEO_EMBOX_BOTTOM_OR_LEFT,
    level & 1 ? HB_DIRECTION_RTL : HB_DIRECTION_LTR,
    HB_OT_TAG_DEFAULT_SCRIPT,
    HB_OT_TAG_DEFAULT_LANGUAGE,
    &ideo
  );

  // idtp
  hb_position_t idtp;
  bool hasIdtp = hb_ot_layout_get_baseline(
    hbfont,
    HB_OT_LAYOUT_BASELINE_TAG_IDEO_EMBOX_TOP_OR_RIGHT,
    level & 1 ? HB_DIRECTION_RTL : HB_DIRECTION_LTR,
    HB_OT_TAG_DEFAULT_SCRIPT,
    HB_OT_TAG_DEFAULT_LANGUAGE,
    &idtp
  );

  if (hasIdce) {
    metrics->central = Idce * fontSize / 1000;
  } else if (hasIdeo && hasIdtp) {
    metrics->central = (ideo + idtp) * fontSize / 2 / 1000;
  } else {
    metrics->central = (metrics->ascender + metrics->descender) / 2;
  }

  if (hasIdeo) {
    metrics->ideographic = ideo * fontSize / 1000;
  } else {
    metrics->ideographic = metrics->descender;
  }

  hb_position_t hang;
  bool hasHang = hb_ot_layout_get_baseline(
    hbfont,
    HB_OT_LAYOUT_BASELINE_TAG_HANGING,
    level & 1 ? HB_DIRECTION_RTL : HB_DIRECTION_LTR,
    HB_OT_TAG_DEFAULT_SCRIPT,
    HB_OT_TAG_DEFAULT_LANGUAGE,
    &hang
  );

  if (hasHang) {
    metrics->hanging = hang * fontSize / 1000;
  } else {
    metrics->hanging = 0.6 * fontSize;
  }
}

static void
orderRange(
  std::vector<GlyphRun>& line,
  size_t begin,
  size_t end
) {
  uint8_t minlevel = 0xff;

  LOG("REORDERING %u..%u\n", begin, end);

  for (size_t i = begin; i < end; i++) {
    minlevel = std::min(minlevel, line[i].level);
  }

  size_t li = begin; // left inner
  size_t ri = end - 1; // right inner

  while (li < ri) {
    size_t lo = li; // left outer
    size_t ro = ri; // right outer

    uint8_t lLevel = line[li].level;
    uint8_t rLevel = line[ri].level;

    if (lLevel == minlevel) {
      li++;
    } else {
      while (li < ri && line[li].level == lLevel) li++;
      if (lo < li) orderRange(line, lo, li);
    }

    if (rLevel == minlevel) {
      ri--;
    } else {
      while (li <= ri && line[ri].level == rLevel) ri--;
      if (ri < ro) orderRange(line, ri + 1, ro + 1);
    }

    if ((minlevel & 1) && ri < ro) {
      size_t lsize = li - lo;
      size_t rsize = ro - ri;
      size_t swap = std::min(lsize, rsize);
      for (size_t i = 0; i < swap; i++) {
        std::swap(line[lo + i], line[ri + 1 + i]);
      }
      // deal with the remainder
      if (lsize > rsize) {
        std::vector<GlyphRun> temp(line.begin() + lo + rsize, line.begin() + li);
        line.erase(line.begin() + lo + rsize, line.begin() + li);
        line.insert(line.begin() + ro + 1 - temp.size(), temp.begin(), temp.end());
      } else if (rsize > lsize) {
        std::vector<GlyphRun> temp(line.begin() + ri + 1 + lsize, line.begin() + ro + 1);
        line.erase(line.begin() + ri + 1 + lsize, line.begin() + ro + 1);
        line.insert(line.begin() + li, temp.begin(), temp.end());
      }
    }
  }
}

static void
orderRunsPhysically(
  std::vector<GlyphRun>& line,
  canvas_state_t* state
) {
  uint8_t levelOr = 0;
  uint8_t levelAnd = 1;

  for (GlyphRun& run : line) {
    levelOr |= run.level;
    levelAnd &= run.level;
  }

  // If none of the levels had the LSB set, all numbers were even
  bool allEven = (levelOr & 1) == 0;
  // If all of the levels had the LSB set, all numbers were odd
  bool allOdd = (levelAnd & 1) == 1;

  if (!allEven && !allOdd) {
    orderRange(line, 0, line.size());
  } else if (allOdd) {
    std::reverse(line.begin(), line.end());
  }
}

TextLayout
layoutText(
  char16_t* textBuffer,
  size_t textLength,
  canvas_state_t* state,
  InstanceData* data
) {
  // All whitespace characters become spaces. Ported from Firefox. Removing
  // paragraphs makes segmenting easier, and there's no concept of paragraphs in
  // canvas.
  for (size_t i = 0; i < textLength; ++i) {
    char16_t ch = textBuffer[i];
    if (ch == u'\x09' || ch == u'\x0A' || ch == u'\x0B' || ch == u'\x0C' || 
        ch == u'\x0D' || ch == u'\x1C' || ch == u'\x1D' || ch == u'\x1E' || 
        ch == u'\x1F' || ch == u'\x85' || ch == u'\x2029') {
      textBuffer[i] = u' ';
    }
  }

#if LOG_LEVEL > 0
  auto script_to_string = [](script_t script) -> const char* {
    switch (script) {
      case SCRIPT_COMMON: return "Common";
      case SCRIPT_LATIN: return "Latin";
      case SCRIPT_GREEK: return "Greek";
      case SCRIPT_CYRILLIC: return "Cyrillic";
      case SCRIPT_ARMENIAN: return "Armenian";
      case SCRIPT_HEBREW: return "Hebrew";
      case SCRIPT_ARABIC: return "Arabic";
      case SCRIPT_INHERITED: return "Inherited";
      case SCRIPT_HIRAGANA: return "Hiragana";
      case SCRIPT_KATAKANA: return "Katakana";
      case SCRIPT_HAN: return "Han";
      case SCRIPT_DEVANAGARI: return "Devanagari";
      case SCRIPT_DESERET: return "Deseret";
      default: return "Unknown";
    }
  };
#endif

  LOG("Processing text with script iterator, buffer size: %zu\n", textLength);

  // Initialize script iterator
  ItemizeState itemizer(textBuffer, textLength, state->direction == "ltr" ? 0 : 1);
  std::vector<std::string> fallbacks;
  script_t lastScript = SCRIPT_NONE;
  double fontSize = state->fontProperties.size;

  hb_buffer_t* buffer = hb_buffer_create();
  hb_buffer_set_cluster_level(buffer, HB_BUFFER_CLUSTER_LEVEL_MONOTONE_CHARACTERS);

  std::vector<ShapeWork> shapingWorkList;
  TextLayout layout;

  bool foundFont = false;

  while (!itemizer.done && itemizer.offset < textLength) {
    size_t start_offset = itemizer.offset;

    itemizeNext(itemizer);

    script_t script = itemizer.script_state.script;
    uint8_t level = itemizer.bidi_state.level;
    
    if (lastScript != script) {
      fallbacks.clear();
      data->fontManager.populateFallbackFonts(fallbacks, script);
      lastScript = script;
    }

    std::vector<FontDescriptor*> matches = data->fontManager.query(
      state->fontProperties,
      data->cppFontSet,
      fallbacks
    );

#if LOG_LEVEL > 0
    std::string cascade = "";
    for (const FontDescriptor* match : matches) {
      if (!cascade.empty()) cascade += ", ";
      cascade += match->family.get();
      cascade += "/" + std::to_string(match->weight) + "/";
      switch (match->style) {
        case FontStyle::Normal: cascade += "Normal"; break;
        case FontStyle::Italic: cascade += "Italic"; break;
        case FontStyle::Oblique: cascade += "Oblique"; break;
      }
    }
#endif

    LOG(
      "%zu..%zu script=%s dir=%hi cascade=%s\n",
      start_offset,
      itemizer.offset - 1,
      script_to_string(script),
      level,
      cascade.c_str()
    );

    shapingWorkList.resize(1);
    shapingWorkList[0].start = start_offset;
    shapingWorkList[0].end = itemizer.offset;
    size_t matchIndex = 0;

    while (shapingWorkList.size() && matchIndex < matches.size()) {
      auto face = matches[matchIndex];
      face->load();
      if (face->data == nullptr) {
        matchIndex++;
        continue;
      }

      LOG("==> %s\n", face->family.get());

      // create the HarfBuzz font
      hb_blob_t* hbblob = hb_blob_create(
        reinterpret_cast<const char *>(face->data.get()),
        face->data_len,
        HB_MEMORY_MODE_READONLY,
        nullptr,
        nullptr
      );
      size_t count = hb_face_count(hbblob);
      // If there's a postscript name, the backend (macOS) requires us to
      // initialize the TTC index
      if (count > 1 && matches[matchIndex]->postscript) {
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
          if (strcmp(buf, face->postscript.get()) == 0) {
            matches[matchIndex]->index = index;
            face->index = index;
            break;
          }
        }
      }
      hb_face_t* hbface = hb_face_create(hbblob, face->index);
      hb_font_t* hbfont = hb_font_create(hbface);
      hb_font_set_scale(hbfont, 1000, 1000);

      if (!foundFont) {
        extractMetrics(hbfont, fontSize, level, &layout.metrics);
        foundFont = true;
      }

      // now we have to try to shape everything in shape work, and anything
      // we can't shape, we push back onto the shape work for the next font
      size_t endWorkForMatch = shapingWorkList.size();
      bool isLastMatch = matchIndex == matches.size() - 1;
      for (size_t workIndex = 0; workIndex < endWorkForMatch; workIndex++) {
        ShapeWork work = shapingWorkList[workIndex];

        // shaping time!
        hb_buffer_set_length(buffer, 0);
        hb_buffer_add_utf16(
          buffer,
          reinterpret_cast<uint16_t*>(textBuffer),
          textLength,
          work.start,
          work.end - work.start
        );
        hb_buffer_set_script(buffer, script_to_hb_script(script));
        hb_buffer_set_language(buffer, hb_language_from_string(state->lang.c_str(), -1));
        hb_buffer_set_direction(
          buffer,
          level & 1 ? HB_DIRECTION_RTL : HB_DIRECTION_LTR
        );
        hb_shape(hbfont, buffer, nullptr, 0);

        LOG("==> shaping %zu..%zu\n", work.start, work.end - 1);

        // reversing the entire buffer for RTL text will make the cluster
        // numbers increase, so it's easier to iterate in parallel with the
        // text itself. the glyphs will be reversed, so we'll have to swap the
        // start and end glyph indexes below
        if (level & 1) hb_buffer_reverse(buffer);

        // Scan for missing glyphs and create new fragments accordingly

        // glyph iteration
        size_t glyphIndex = 0;
        unsigned int glyphCount = hb_buffer_get_length(buffer);
        hb_glyph_info_t* glyphInfos = hb_buffer_get_glyph_infos(buffer, nullptr);

        bool glyphsNeedReshape = false;

        // text iteration (graphemes, codepoints, and text index)
        uint8_t graphemeState = 0;
        size_t textIndex = work.start;
        uint32_t leftCodepoint = codePointAt(textBuffer, textLength, &textIndex);
        size_t graphemeDivider;

        // the working segment
        Segment segment {work.start, work.start, glyphIndex, glyphIndex, false};

        // TODO: assert: textIndex <= w.end
        do {
          graphemeDivider = textIndex;
          while (glyphIndex < glyphCount && glyphInfos[glyphIndex].cluster < graphemeDivider) {
            if (glyphInfos[glyphIndex].codepoint == 0) {
              glyphsNeedReshape = true;
            }
            glyphIndex++;
          }

          bool isBreak;
          uint32_t rightCodepoint;

          if (graphemeDivider >= work.end) {
            isBreak = true;
          } else {
            rightCodepoint = codePointAt(textBuffer, textLength, &textIndex);
            isBreak = grapheme_break(&graphemeState, leftCodepoint, rightCodepoint);
          }

          if (isBreak) {
            if (segment.textStart == segment.textEnd) {
              segment.needsReshape = glyphsNeedReshape; // very first grapheme
            }
            if (glyphsNeedReshape == segment.needsReshape) {
              // extend the segment
              segment.textEnd = graphemeDivider;
              segment.glyphEnd = glyphIndex;
            } else {
              // finish the last segment, not including this grapheme
              flushSegment(segment, shapingWorkList, layout.runs, level, face, hbfont, buffer, isLastMatch);

              // start a new segment that includes this grapheme
              segment.textStart = segment.textEnd;
              segment.textEnd = graphemeDivider;
              segment.glyphStart = segment.glyphEnd;
              segment.glyphEnd = glyphIndex;
              segment.needsReshape = glyphsNeedReshape;
            }

            if (graphemeDivider >= work.end) {
              flushSegment(segment, shapingWorkList, layout.runs, level, face, hbfont, buffer, isLastMatch);
            }

            glyphsNeedReshape = false;
          }

          leftCodepoint = rightCodepoint;
        } while (graphemeDivider < work.end);
      }

      matchIndex++;
      hb_font_destroy(hbfont);
      hb_face_destroy(hbface);
      hb_blob_destroy(hbblob);
      shapingWorkList.erase(
        shapingWorkList.begin(),
        shapingWorkList.begin() + endWorkForMatch
      );
    }
  }

  hb_buffer_destroy(buffer);

  std::sort(layout.runs.begin(), layout.runs.end(), compareGlyphRunTextPosition);
  orderRunsPhysically(layout.runs, state);

  layout.anchorY = getBaselineAdjustment(state->textBaseline, layout.metrics, fontSize);

  layout.width = 0;
  for (GlyphRun& run : layout.runs) {
    double toPx = fontSize / 1000;
    for (Glyph& glyph : run.glyphs) {
      layout.width += glyph.x_advance * toPx;
    }
  }

  switch (resolveTextAlignment(state)) {
    case TEXT_ALIGNMENT_CENTER:
      layout.anchorX = layout.width / 2;
      break;
    case TEXT_ALIGNMENT_RIGHT:
      layout.anchorX = layout.width;
      break;
    default: // TEXT_ALIGNMENT_LEFT
      layout.anchorX = 0;
      break;
  }

  return layout;
}

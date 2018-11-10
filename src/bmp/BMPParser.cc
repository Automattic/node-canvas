#include <cassert>

#include "BMPParser.h"

using namespace std;
using namespace BMPParser;

#define MAX_IMG_SIZE 10000

#define E(cond, msg) if(cond) return setErr(msg)
#define EU(cond, msg) if(cond) return setErrUnsupported(msg)
#define EX(cond, msg) if(cond) return setErrUnknown(msg)

#define I1() get<char>()
#define U1() get<uint8_t>()
#define I2() get<int16_t>()
#define U2() get<uint16_t>()
#define I4() get<int32_t>()
#define U4() get<uint32_t>()

#define I1UC() get<char, false>()
#define U1UC() get<uint8_t, false>()
#define I2UC() get<int16_t, false>()
#define U2UC() get<uint16_t, false>()
#define I4UC() get<int32_t, false>()
#define U4UC() get<uint32_t, false>()

#define CALC_MASK(col) \
  col##Mask = U4(); \
  if(col##Mask == 0xffu) col##Mask = 0; \
  else if(col##Mask == 0xff00u) col##Mask = 8; \
  else if(col##Mask == 0xff0000u) col##Mask = 16; \
  else if(col##Mask == 0xff000000u) col##Mask = 24; \
  else EU(1, #col " mask");

#define CHECK_OVERRUN(size, type) \
  if(ptr + (size) - data > len){ \
    setErr("unexpected end of file"); \
    return type(); \
  }

Parser::~Parser(){
  data = nullptr;
  ptr = nullptr;

  if(imgd){
    delete[] imgd;
    imgd = nullptr;
  }
}

void Parser::parse(uint8_t *buf, int bufSize, uint8_t *format){
  assert(status == Status::EMPTY);

  data = ptr = buf;
  len = bufSize;

  // Start parsing file header
  setOp("file header");

  // File header signature
  string fhSig = getStr(2);
  string temp = "file header signature";
  EU(fhSig == "BA", temp + " \"BA\"");
  EU(fhSig == "CI", temp + " \"CI\"");
  EU(fhSig == "CP", temp + " \"CP\"");
  EU(fhSig == "IC", temp + " \"IC\"");
  EU(fhSig == "PT", temp + " \"PT\"");
  EX(fhSig != "BM", temp); // BM

  // Length of the file should be equal to `len`
  E(U4() != static_cast<uint32_t>(len), "inconsistent file size");

  // Skip unused values
  skip(4);

  // Offset where the pixel array (bitmap data) can be found
  auto imgdOffset = U4();

  // Start parsing DIB header
  setOp("DIB header");

  // Prepare some variables in case they are needed
  uint32_t compr = 0;
  uint32_t redMask = 0, greenMask = 0, blueMask = 0, alphaMask = 0;

  /**
   * Type of the DIB (device-independent bitmap) header
   * is determined by its size. Most BMP files use BITMAPINFOHEADER.
   */
  auto dibSize = U4();
  temp = "DIB header";
  EU(dibSize == 64, temp + " \"OS22XBITMAPHEADER\"");
  EU(dibSize == 16, temp + " \"OS22XBITMAPHEADER\"");
  EU(dibSize == 52, temp + " \"BITMAPV2INFOHEADER\"");
  EU(dibSize == 56, temp + " \"BITMAPV3INFOHEADER\"");
  EU(dibSize == 124, temp + " \"BITMAPV5HEADER\"");

  // BITMAPCOREHEADER, BITMAPINFOHEADER, BITMAPV4HEADER
  auto isDibValid = dibSize == 12 || dibSize == 40 || dibSize == 108;
  EX(!isDibValid, temp);

  // Image width
  w = dibSize == 12 ? U2() : I4();
  E(!w, "image width is 0");
  E(w < 0, "negative image width");
  E(w > MAX_IMG_SIZE, "too large image width");

  // Image height (specification allows negative values)
  h = dibSize == 12 ? U2() : I4();
  E(!h, "image height is 0");
  E(h > MAX_IMG_SIZE, "too large image height");

  bool isHeightNegative = h < 0;
  if(isHeightNegative) h = -h;

  // Number of color planes (must be 1)
  E(U2() != 1, "number of color planes must be 1");

  // Bits per pixel (color depth)
  auto bpp = U2();
  auto isBppValid = bpp == 1  || bpp == 24 || bpp == 32;
  EU(!isBppValid, "color depth");

  // Calculate image data size and padding
  uint32_t expectedImgdSize = (((w * bpp + 31) >> 5) << 2) * h;
  uint32_t rowPadding = (-w * bpp & 31) >> 3;
  uint32_t imgdSize = 0;

  if(dibSize == 40 || dibSize == 108){
    // Compression type
    compr = U4();
    temp = "compression type";
    EU(compr == 1, temp + " \"BI_RLE8\"");
    EU(compr == 2, temp + " \"BI_RLE4\"");
    EU(compr == 4, temp + " \"BI_JPEG\"");
    EU(compr == 5, temp + " \"BI_PNG\"");
    EU(compr == 6, temp + " \"BI_ALPHABITFIELDS\"");
    EU(compr == 11, temp + " \"BI_CMYK\"");
    EU(compr == 12, temp + " \"BI_CMYKRLE8\"");
    EU(compr == 13, temp + " \"BI_CMYKRLE4\"");

    // BI_RGB and BI_BITFIELDS
    auto isComprValid = compr == 0 || compr == 3;
    EX(!isComprValid, temp);
    
    // Also ensure that BI_BITFIELDS appears only with BITMAPV4HEADER and 32-bit colors
    if(compr == 3){
      E(dibSize != 108, "compression BI_BITFIELDS can be used only with BITMAPV4HEADER");
      E(bpp != 32, "compression BI_BITFIELDS can be used only with 32-bit color depth");
    }

    // Size of the image data
    imgdSize = U4();

    // Horizontal and vertical resolution (ignored)
    skip(8);

    // Number of colors in the palette or 0 if no palette is present
    auto palColNum = U4();
    EU(palColNum, "non-empty color palette");

    // Number of important colors used or 0 if all colors are important
    auto impCols = U4();
    EU(impCols, "non-zero important colors");

    // BITMAPV4HEADER has additional properties
    if(dibSize == 108){
      // If BI_BITFIELDS are used, calculate masks, otherwise ignore them
      if(compr == 3){
        // Convert each mask to bit offset for faster shifting
        CALC_MASK(red);
        CALC_MASK(green);
        CALC_MASK(blue);
        CALC_MASK(alpha);
      }else{
        skip(16);
      }

      // Encure that the color space is LCS_WINDOWS_COLOR_SPACE
      string colSpace = getStr(4, 1);
      EU(colSpace != "Win ", "color space \"" + colSpace + "\"");

      // The rest 48 bytes are ignored for LCS_WINDOWS_COLOR_SPACE
      skip(48);
    }
  }

  /**
   * Skip to the image data. There may be other chunks between,
   * but they are optional.
   */
  E(ptr - data > imgdOffset, "image data overlaps with another structure");
  ptr = data + imgdOffset;

  // Start parsing image data
  setOp("image data");

  if(!imgdSize){
    // Value 0 is allowed only for BI_RGB compression type
    E(compr != 0, "missing image data size");
    imgdSize = expectedImgdSize;
  }else{
    E(imgdSize != expectedImgdSize, "inconsistent image data size");
  }

  // Ensure that all image data is present
  E(ptr - data + imgdSize > len, "not enough image data");

  // Direction of reading rows
  int yStart = h - 1;
  int yEnd = -1;
  int dy = isHeightNegative ? 1 : -1;

  // In case of negative height, read rows backward
  if(isHeightNegative){
    yStart = 0;
    yEnd = h;
  }

  // Allocate output image data array
  int buffLen = w * h << 2;
  imgd = new (nothrow) uint8_t[buffLen];
  E(!imgd, "unable to allocate memory");

  // Prepare color valus
  uint8_t color[4] = {0};
  uint8_t &red = color[0];
  uint8_t &green = color[1];
  uint8_t &blue = color[2];
  uint8_t &alpha = color[3];

  // Check if pre-multiplied alpha is used
  bool premul = format ? format[4] : 0;

  // Main loop
  for(int y = yStart; y != yEnd; y += dy){
    // Use in-byte offset for bpp < 8
    uint8_t colOffset = 0;
    uint8_t cval = 0;

    for(int x = 0; x != w; x++){
      // Index in the output image data
      int i = (x + y * w) << 2;

      switch(compr){
        case 0: // BI_RGB
          switch(bpp){
            case 1:
              if(colOffset) ptr--;
              cval = (U1UC() >> (7 - colOffset)) & 1;
              red = green = blue = cval ? 255 : 0;
              alpha = 255;
              colOffset = (colOffset + 1) & 7;
              break;

            case 24:
              blue = U1UC();
              green = U1UC();
              red = U1UC();
              alpha = 255;
              break;

            case 32:
              blue = U1UC();
              green = U1UC();
              red = U1UC();
              alpha = U1UC();
              break;
          }
          break;

        case 3: // BI_BITFIELDS
          auto col = U4UC();
          red = col >> redMask;
          green = col >> greenMask;
          blue = col >> blueMask;
          alpha = col >> alphaMask;
          break;
      }

      /**
       * Pixel format:
       *  red,
       *  green,
       *  blue,
       *  alpha,
       *  is alpha pre-multiplied
       * Default is [0, 1, 2, 3, 0]
       */

      if(premul && alpha != 255){
        double a = alpha / 255.;
        red = static_cast<uint8_t>(red * a + .5);
        green = static_cast<uint8_t>(green * a + .5);
        blue = static_cast<uint8_t>(blue * a + .5);
      }

      if(format){
        imgd[i] = color[format[0]];
        imgd[i + 1] = color[format[1]];
        imgd[i + 2] = color[format[2]];
        imgd[i + 3] = color[format[3]];
      }else{
        imgd[i] = red;
        imgd[i + 1] = green;
        imgd[i + 2] = blue;
        imgd[i + 3] = alpha;
      }
    }

    // Skip unused bytes in the current row
    skip(rowPadding);
  }

  if(status == Status::ERROR)
    return;

  E(ptr - data != len, "extra data found at the end of file");
  status = Status::OK;
};

void Parser::clearImgd(){ imgd = nullptr; }
int32_t Parser::getWidth() const{ return w; }
int32_t Parser::getHeight() const{ return h; }
uint8_t *Parser::getImgd() const{ return imgd; }
Status Parser::getStatus() const{ return status; }

string Parser::getErrMsg() const{
  return "Error while processing " + getOp() + " - " + err;
}

template <typename T, bool check> T Parser::get(){
  if(check)
    CHECK_OVERRUN(sizeof(T), T);
  T val = *(T*)ptr;
  ptr += sizeof(T);
  return val;
}

string Parser::getStr(int size, bool reverse){
  CHECK_OVERRUN(size, string);
  string val = "";

  while(size--){
    if(reverse) val = string(1, static_cast<char>(*ptr++)) + val;
    else val += static_cast<char>(*ptr++);
  }

  return val;
}

void Parser::skip(int size){
  CHECK_OVERRUN(size, void);
  ptr += size;
}

void Parser::setOp(string val){
  if(status != Status::EMPTY) return;
  op = val;
}

string Parser::getOp() const{
  return op;
}

void Parser::setErrUnsupported(string msg){
  setErr("unsupported " + msg);
}

void Parser::setErrUnknown(string msg){
  setErr("unknown " + msg);
}

void Parser::setErr(string msg){
  if(status != Status::EMPTY) return;
  err = msg;
  status = Status::ERROR;
}

string Parser::getErr() const{
  return err;
}

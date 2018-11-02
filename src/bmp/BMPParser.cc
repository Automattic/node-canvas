#include "BMPParser.h"

using namespace std;
using namespace BMPParser;

#define MAX_IMG_SIZE 10000

#define E(cond, msg) if(cond) return setErr(msg)
#define EU(cond, msg) if(cond) return setErrUnsupported(msg)
#define EX(cond, msg) if(cond) return setErrUnknown(msg)

#define I1() get<char>()
#define U1() get<byte>()
#define I2() get<int16_t>()
#define U2() get<uint16_t>()
#define I4() get<int32_t>()
#define U4() get<uint32_t>()

#define CALC_MASK(col) \
  col##Mask = U4(); \
  if(col##Mask == 0xffu) col##Mask = 0; \
  else if(col##Mask == 0xff00u) col##Mask = 8; \
  else if(col##Mask == 0xff0000u) col##Mask = 16; \
  else if(col##Mask == 0xff000000u) col##Mask = 24; \
  else EU(1, #col " mask");

#define CHECK_OVERFLOW(size, type) \
  if(ptr + (size) - data > len){ \
    setErr("unexpected end of file"); \
    return type(); \
  }

Parser::Parser(){
  status = Status::EMPTY;

  w = 0;
  h = 0;

  data = nullptr;
  ptr = nullptr;
  imgd = nullptr;

  op = "";
  err = "";
}

Parser::~Parser(){
  data = nullptr;
  ptr = nullptr;

  if(imgd){
    delete[] imgd;
    imgd = nullptr;
  }
}

void Parser::parse(byte *buf, int bufSize, byte *format){
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
  E(U4() != (uint32_t)len, "inconsistent file size");

  // Skip unused values
  skip(4);

  // Offset where the pixel array (bitmap data) can be found
  auto imgdOffset = U4();

  // Start parsing DIB header
  setOp("DIB header");

  /**
   * Type of the DIB (device-independent bitmap) header
   * is determined by its size. Most BMP files use BITMAPINFOHEADER.
   */
  auto dibSize = U4();
  temp = "DIB header";
  EU(dibSize == 12, temp + " \"BITMAPCOREHEADER\"");
  EU(dibSize == 64, temp + " \"OS22XBITMAPHEADER\"");
  EU(dibSize == 16, temp + " \"OS22XBITMAPHEADER\"");
  EU(dibSize == 52, temp + " \"BITMAPV2INFOHEADER\"");
  EU(dibSize == 56, temp + " \"BITMAPV3INFOHEADER\"");
  EU(dibSize == 124, temp + " \"BITMAPV5HEADER\"");

  // BITMAPINFOHEADER and BITMAPV4HEADER
  auto isDibValid = dibSize == 40 || dibSize == 108;
  EX(!isDibValid, temp);

  // Image width (specification allows non-positive values)
  w = I4();
  EU(w <= 0, "non-positive image width");
  E(w > MAX_IMG_SIZE, "too large image width");

  // Image height (specification allows non-positive values)
  h = I4();
  EU(h <= 0, "non-positive image height");
  E(h > MAX_IMG_SIZE, "too large image height");

  // Number of color planes (must be 1)
  E(U2() != 1, "number of color planes must be 1");

  // Bits per pixel (color depth)
  auto bpp = U2();
  auto isBppValid = bpp == 1  || bpp == 24 || bpp == 32;
  EU(!isBppValid, "color depth");

  // Compression type
  auto compr = U4();
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

  // Calculate image data size and padding
  uint32_t expectedImgdSize = (((w * bpp + 31) >> 5) << 2) * h;
  uint32_t rowPadding = (-w * bpp & 31) >> 3;

  // Size of the image data
  auto imgdSize = U4();
  if(!imgdSize)
    // Value 0 is allowed for BI_RGB compression type
    imgdSize = expectedImgdSize;
  else
    E(imgdSize != expectedImgdSize, "inconsistent image data size");

  // Horizontal and vertical resolution (ignored)
  skip(8);

  // Number of colors in the palette or 0 if no palette is present
  auto palColNum = U4();
  EU(palColNum, "non-empty color palette");

  // Number of important colors used or 0 if all colors are important
  auto impCols = U4();
  EU(impCols, "non-zero important colors");

  // Prepare masks in case they are needed
  uint32_t redMask = 0, greenMask = 0, blueMask = 0, alphaMask = 0;

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

  /**
   * Skip to the image data. There may be other chunks between,
   * but they are optional.
   */
  ptr = data + imgdOffset;

  // Start parsing image data
  setOp("image data");

  // Allocate RGBA image data array
  int buffLen = w * h << 2;
  imgd = new byte[buffLen];

  // Prepare color valus
  byte color[4] = {0};
  byte &red = color[0];
  byte &green = color[1];
  byte &blue = color[2];
  byte &alpha = color[3];

  // Check if pre-multiplied alpha is used
  bool premul = format ? format[4] : 0;

  // Bitmap data starts at the lower left corner
  for(int y = h - 1; y != -1; y--){
    // Use in-byte offset for bpp < 8
    byte colOffset = 0;
    byte cval = 0;

    for(int x = 0; x != w; x++){
      // Index in the RGBA image data
      int i = (x + y * w) << 2;

      switch(compr){
        case 0: // BI_RGB
          switch(bpp){
            case 1:
              if(colOffset) ptr--;
              cval = (U1() >> (7 - colOffset)) & 1;
              red = green = blue = cval ? 255 : 0;
              alpha = 255;
              colOffset = (colOffset + 1) & 7;
              break;

            case 24:
              blue = U1();
              green = U1();
              red = U1();
              alpha = 255;
              break;

            case 32:
              blue = U1();
              green = U1();
              red = U1();
              alpha = U1();
              break;
          }
          break;

        case 3: // BI_BITFIELDS
          auto col = U4();
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
        red = (byte)(red * a + .5);
        green = (byte)(green * a + .5);
        blue = (byte)(blue * a + .5);
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

  E(ptr - data != len, "extra data found at the end of file");
  status = Status::OK;
};

void Parser::clearImgd(){ imgd = nullptr; }
int32_t Parser::getWidth() const{ return w; }
int32_t Parser::getHeight() const{ return h; }
byte *Parser::getImgd() const{ return imgd; }
Status Parser::getStatus() const{ return status; }

string Parser::getErrMsg() const{
  return "Error while processing " + getOp() + " - " + err;
}

template <typename T> T Parser::get(){
  CHECK_OVERFLOW(sizeof(T), T);
  T val = *(T*)ptr;
  ptr += sizeof(T);
  return val;
}

string Parser::getStr(int size, bool reverse){
  CHECK_OVERFLOW(size, string);
  string val = "";

  while(size--){
    if(reverse) val = string(1, (char)*ptr++) + val;
    else val += (char)*ptr++;
  }

  return val;
}

void Parser::skip(int size){
  CHECK_OVERFLOW(size, void);
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

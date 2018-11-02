#ifndef __NODE_BMP_PARSER_H__
#define __NODE_BMP_PARSER_H__

#ifdef ERROR
#define ERROR_ ERROR
#undef ERROR
#endif

#include <iostream>
#include <string>
#include <cassert>

using namespace std;

namespace BMPParser{
  typedef uint8_t byte;

  enum Status{
    EMPTY,
    OK,
    ERROR,
  };

  class Parser{
  public:
    Parser();
    ~Parser();
    void parse(byte *buf, int bufSize, byte *format=nullptr);
    void clearImgd();
    int32_t getWidth() const;
    int32_t getHeight() const;
    byte *getImgd() const;
    Status getStatus() const;
    string getErrMsg() const;

  private:
    Status status;

    byte *data;
    byte *ptr;
    int len;

    int32_t w;
    int32_t h;
    byte *imgd;

    string err;
    string op;

    template <typename T> T get();
    string getStr(int len, bool reverse=false);
    void skip(int len);

    void setOp(string val);
    string getOp() const;

    void setErrUnsupported(string msg);
    void setErrUnknown(string msg);
    void setErr(string msg);
    string getErr() const;
  };
}

#ifdef ERROR_
#define ERROR ERROR_
#undef ERROR_
#endif

#endif

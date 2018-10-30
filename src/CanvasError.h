#ifndef __CANVAS_ERROR_H__
#define __CANVAS_ERROR_H__

#include <string>

class CanvasError {
  public:
    std::string message;
    std::string syscall;
    std::string path;
    int cerrno = 0;
    void set(char *iMessage = NULL, char *iSyscall = NULL, int iErrno = 0, char *iPath = NULL) {
      if (iMessage) message = std::string(iMessage);
      if (iSyscall) syscall = std::string(iSyscall);
      cerrno = iErrno;
      if (iPath) path = std::string(iPath);
    }
    void reset() {
      message.clear();
      syscall.clear();
      path.clear();
      cerrno = 0;
    }
};

#endif

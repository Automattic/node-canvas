#include "FBDevBackend.h"
#include "ImageBackend.h"

#include <iostream>

void printBackendInfo(Backend *backend) {
  cout << "Name: " << backend->getName()
  << ", Surface Pointer: " << backend->getSurface()
  << ", Size: " << backend->getWidth() << "x" << backend->getHeight() << endl;
}

int main() {
  Backend *backend = NULL;

  backend = new FBDevBackend("/dev/fb0");
  backend->createSurface();
  try {
    backend->recreateSurface();
  } catch (BackendOperationNotAvailable bona) {
    cerr << bona.what() << endl;
  }
  printBackendInfo(backend);
  delete backend;

  backend = new ImageBackend(1920, 1080);
  backend->createSurface();
  printBackendInfo(backend);
  delete backend;
}

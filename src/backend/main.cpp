#include "FBDevBackend.hpp"
#include "ImageBackend.hpp"

int main() {
  Backend *backend = NULL;

  backend = new FBDevBackend("/dev/fb0");
  backend->createSurface();
  cout << backend->getName() << endl;
  cout << backend->getSurface() << endl;
  delete backend;

  backend = new ImageBackend(1920, 1080);
  backend->createSurface();
  cout << backend->getName() << endl;
  cout << backend->getSurface() << endl;
  delete backend;
}

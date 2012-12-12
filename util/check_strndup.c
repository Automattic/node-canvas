/**
 * Checks for for strndup. Some OS X (10.6.x) don't have it.
 */
#include <string.h>

int
main( void ) {
  char *a = "abc";
  char *b;
  b = strndup( a, 3 );
}

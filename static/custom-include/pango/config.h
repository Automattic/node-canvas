/* config.h.  Generated from config.h.in by configure.  */
/* config.h.in.  Generated from configure.ac by autoheader.  */

/* Have usable Cairo library and font backend */
#define HAVE_CAIRO 1

/* Whether Cairo can use FreeType for fonts */
#define HAVE_CAIRO_FREETYPE 1

/* Whether Cairo has PDF support */
#define HAVE_CAIRO_PDF 1

/* Whether Cairo has PNG support */
#define HAVE_CAIRO_PNG 1

/* Whether Cairo has PS support */
#define HAVE_CAIRO_PS 1

/* Whether Cairo can use Quartz for fonts */
/* #undef HAVE_CAIRO_QUARTZ */

/* Whether Cairo can use the Win32 GDI for fonts */
/* #undef HAVE_CAIRO_WIN32 */

/* Whether Cairo has Xlib support */
#define HAVE_CAIRO_XLIB 1

/* Whether CoreText is available on the system */
/* #undef HAVE_CORE_TEXT */

/* Define to 1 if you have the <dirent.h> header file, and it defines `DIR'.
   */
#define HAVE_DIRENT_H 1

/* Define to 1 if you have the <dlfcn.h> header file. */
#define HAVE_DLFCN_H 1

/* Define to 1 if you have the `FcWeightFromOpenType' function. */
#define HAVE_FCWEIGHTFROMOPENTYPE 1

/* Define to 1 if you have the `flockfile' function. */
#define HAVE_FLOCKFILE 1

/* Have FreeType 2 library */
#define HAVE_FREETYPE 1

/* Define to 1 if you have the `getpagesize' function. */
#define HAVE_GETPAGESIZE 1

/* Define to 1 if you have the <inttypes.h> header file. */
#define HAVE_INTTYPES_H 1

/* Whether libthai is available */
/* #undef HAVE_LIBTHAI */

/* Define to 1 if you have the <memory.h> header file. */
#define HAVE_MEMORY_H 1

/* Define to 1 if you have the <ndir.h> header file, and it defines `DIR'. */
/* #undef HAVE_NDIR_H */

/* Define to 1 if you have the <stdint.h> header file. */
#define HAVE_STDINT_H 1

/* Define to 1 if you have the <stdlib.h> header file. */
#define HAVE_STDLIB_H 1

/* Define to 1 if you have the <strings.h> header file. */
#define HAVE_STRINGS_H 1

/* Define to 1 if you have the <string.h> header file. */
#define HAVE_STRING_H 1

/* Define to 1 if you have the `strtok_r' function. */
#define HAVE_STRTOK_R 1

/* Define to 1 if you have the `sysconf' function. */
#define HAVE_SYSCONF 1

/* Define to 1 if you have the <sys/dir.h> header file, and it defines `DIR'.
   */
/* #undef HAVE_SYS_DIR_H */

/* Define to 1 if you have the <sys/mman.h> header file. */
#define HAVE_SYS_MMAN_H 1

/* Define to 1 if you have the <sys/ndir.h> header file, and it defines `DIR'.
   */
/* #undef HAVE_SYS_NDIR_H */

/* Define to 1 if you have the <sys/stat.h> header file. */
#define HAVE_SYS_STAT_H 1

/* Define to 1 if you have the <sys/types.h> header file. */
#define HAVE_SYS_TYPES_H 1

/* Define to 1 if you have the <unistd.h> header file. */
#define HAVE_UNISTD_H 1

/* Have Xft library */
/* #undef HAVE_XFT */

/* Define to the sub-directory where libtool stores uninstalled libraries. */
#define LT_OBJDIR ".libs/"

/* Name of package */
#define PACKAGE "pango"

/* Define to the address where bug reports for this package should be sent. */
#define PACKAGE_BUGREPORT "http://bugzilla.gnome.org/enter_bug.cgi?product=pango"

/* Define to the full name of this package. */
#define PACKAGE_NAME "pango"

/* Define to the full name and version of this package. */
#define PACKAGE_STRING "pango 1.40.3"

/* Define to the one symbol short name of this package. */
#define PACKAGE_TARNAME "pango"

/* Define to the home page for this package. */
#define PACKAGE_URL ""

/* Define to the version of this package. */
#define PACKAGE_VERSION "1.40.3"

/* PANGO binary age */
#define PANGO_BINARY_AGE 4003

/* PANGO interface age */
#define PANGO_INTERFACE_AGE 3

/* PANGO major version */
#define PANGO_VERSION_MAJOR 1

/* PANGO micro version */
#define PANGO_VERSION_MICRO 3

/* PANGO minor version */
#define PANGO_VERSION_MINOR 40

/* Define to 1 if you have the ANSI C header files. */
#define STDC_HEADERS 1

/* Version number of package */
#define VERSION "1.40.3"

/* defines how to decorate public symbols while building */
#define _PANGO_EXTERN __attribute__((visibility("default"))) extern

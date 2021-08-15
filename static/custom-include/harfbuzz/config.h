/* config.h.  Generated from config.h.in by configure.  */
/* config.h.in.  Generated from configure.ac by autoheader.  */

/* The normal alignment of `struct{char;}', in bytes. */
#define ALIGNOF_STRUCT_CHAR__ 1

/* Define to 1 if you have the `atexit' function. */
#define HAVE_ATEXIT 1

/* Have cairo graphics library */
#define HAVE_CAIRO 1

/* Have cairo-ft support in cairo graphics library */
#define HAVE_CAIRO_FT 1

/* Have Core Text backend */
/* #undef HAVE_CORETEXT */

/* Have DirectWrite library */
/* #undef HAVE_DIRECTWRITE */

/* Define to 1 if you have the <dlfcn.h> header file. */
#define HAVE_DLFCN_H 1

/* Define to 1 if you have the <dwrite.h> header file. */
/* #undef HAVE_DWRITE_H */

/* Have simple TrueType Layout backend */
#define HAVE_FALLBACK 1

/* Have fontconfig library */
#define HAVE_FONTCONFIG 1

/* Have FreeType 2 library */
#define HAVE_FREETYPE 1

/* Define to 1 if you have the `FT_Get_Var_Blend_Coordinates' function. */
/* #undef HAVE_FT_GET_VAR_BLEND_COORDINATES */

/* Define to 1 if you have the `getpagesize' function. */
#define HAVE_GETPAGESIZE 1

/* Have glib2 library */
#define HAVE_GLIB 1

/* Have gobject2 library */
/* #undef HAVE_GOBJECT */

/* Have Graphite2 library */
/* #undef HAVE_GRAPHITE2 */

/* Have ICU library */
#define HAVE_ICU 1

/* Use hb-icu Unicode callbacks */
/* #undef HAVE_ICU_BUILTIN */

/* Have Intel __sync_* atomic primitives */
#define HAVE_INTEL_ATOMIC_PRIMITIVES 1

/* Define to 1 if you have the <inttypes.h> header file. */
#define HAVE_INTTYPES_H 1

/* Define to 1 if you have the `isatty' function. */
#define HAVE_ISATTY 1

/* Define to 1 if you have the <memory.h> header file. */
#define HAVE_MEMORY_H 1

/* Define to 1 if you have the `mmap' function. */
#define HAVE_MMAP 1

/* Define to 1 if you have the `mprotect' function. */
#define HAVE_MPROTECT 1

/* Have native OpenType Layout backend */
#define HAVE_OT 1

/* Have POSIX threads */
#define HAVE_PTHREAD 1

/* Have PTHREAD_PRIO_INHERIT. */
#define HAVE_PTHREAD_PRIO_INHERIT 1

/* Define to 1 if you have the <sched.h> header file. */
/* #undef HAVE_SCHED_H */

/* Have sched_yield */
/* #undef HAVE_SCHED_YIELD */

/* Have Solaris __machine_*_barrier and atomic_* operations */
/* #undef HAVE_SOLARIS_ATOMIC_OPS */

/* Define to 1 if you have the <stdint.h> header file. */
#define HAVE_STDINT_H 1

/* Define to 1 if you have the <stdlib.h> header file. */
#define HAVE_STDLIB_H 1

/* Define to 1 if you have the <strings.h> header file. */
#define HAVE_STRINGS_H 1

/* Define to 1 if you have the <string.h> header file. */
#define HAVE_STRING_H 1

/* Define to 1 if you have the `sysconf' function. */
#define HAVE_SYSCONF 1

/* Define to 1 if you have the <sys/mman.h> header file. */
#define HAVE_SYS_MMAN_H 1

/* Define to 1 if you have the <sys/stat.h> header file. */
#define HAVE_SYS_STAT_H 1

/* Define to 1 if you have the <sys/types.h> header file. */
#define HAVE_SYS_TYPES_H 1

/* Have UCDN Unicode functions */
#define HAVE_UCDN 1

/* Have Uniscribe library */
/* #undef HAVE_UNISCRIBE */

/* Define to 1 if you have the <unistd.h> header file. */
#define HAVE_UNISTD_H 1

/* Define to 1 if you have the <usp10.h> header file. */
/* #undef HAVE_USP10_H */

/* Define to 1 if you have the <windows.h> header file. */
/* #undef HAVE_WINDOWS_H */

/* Define to the sub-directory in which libtool stores uninstalled libraries.
   */
#define LT_OBJDIR ".libs/"

/* Define to the address where bug reports for this package should be sent. */
#define PACKAGE_BUGREPORT "https://github.com/behdad/harfbuzz/issues/new"

/* Define to the full name of this package. */
#define PACKAGE_NAME "HarfBuzz"

/* Define to the full name and version of this package. */
#define PACKAGE_STRING "HarfBuzz 1.4.2"

/* Define to the one symbol short name of this package. */
#define PACKAGE_TARNAME "harfbuzz"

/* Define to the home page for this package. */
#define PACKAGE_URL "http://harfbuzz.org/"

/* Define to the version of this package. */
#define PACKAGE_VERSION "1.4.2"

/* Define to necessary symbol if this constant uses a non-standard name on
   your system. */
/* #undef PTHREAD_CREATE_JOINABLE */

/* Define to 1 if you have the ANSI C header files. */
#define STDC_HEADERS 1

/* Enable extensions on AIX 3, Interix.  */
#ifndef _ALL_SOURCE
# define _ALL_SOURCE 1
#endif
/* Enable GNU extensions on systems that have them.  */
#ifndef _GNU_SOURCE
# define _GNU_SOURCE 1
#endif
/* Enable threading extensions on Solaris.  */
#ifndef _POSIX_PTHREAD_SEMANTICS
# define _POSIX_PTHREAD_SEMANTICS 1
#endif
/* Enable extensions on HP NonStop.  */
#ifndef _TANDEM_SOURCE
# define _TANDEM_SOURCE 1
#endif
/* Enable general extensions on Solaris.  */
#ifndef __EXTENSIONS__
# define __EXTENSIONS__ 1
#endif


/* Enable large inode numbers on Mac OS X 10.5.  */
#ifndef _DARWIN_USE_64_BIT_INODE
# define _DARWIN_USE_64_BIT_INODE 1
#endif

/* Number of bits in a file offset, on hosts where this is settable. */
/* #undef _FILE_OFFSET_BITS */

/* Define for large files, on AIX-style hosts. */
/* #undef _LARGE_FILES */

/* Define to 1 if on MINIX. */
/* #undef _MINIX */

/* Define to 2 if the system does not provide POSIX.1 features except with
   this defined. */
/* #undef _POSIX_1_SOURCE */

/* Define to 1 if you need to in order for `stat' and other things to work. */
/* #undef _POSIX_SOURCE */

/* config.h.  Generated from config.h.in by configure.  */
/* config.h.in.  Generated from configure.ac by autoheader.  */

/* Define if building universal (internal helper macro) */
/* #undef AC_APPLE_UNIVERSAL_BUILD */

/* whether memory barriers are needed around atomic operations */
/* #undef ATOMIC_OP_NEEDS_MEMORY_BARRIER */

/* Define to 1 if the PDF backend can be tested (need poppler and other
   dependencies for pdf2png) */
/* #undef CAIRO_CAN_TEST_PDF_SURFACE */

/* Define to 1 if the PS backend can be tested (needs ghostscript) */
#define CAIRO_CAN_TEST_PS_SURFACE 1

/* Define to 1 if the SVG backend can be tested */
/* #undef CAIRO_CAN_TEST_SVG_SURFACE */

/* Define to 1 if the Win32 Printing backend can be tested (needs ghostscript)
   */
/* #undef CAIRO_CAN_TEST_WIN32_PRINTING_SURFACE */

/* Define to 1 if dlsym is available */
#define CAIRO_HAS_DLSYM 1

/* Define to 1 to enable cairo's cairo-script-interpreter feature */
#define CAIRO_HAS_INTERPRETER 1

/* Define to 1 to enable cairo's pthread feature */
#define CAIRO_HAS_PTHREAD 1

/* Define to 1 if we have full pthread support */
#define CAIRO_HAS_REAL_PTHREAD 1

/* Define to 1 if libspectre is available */
/* #undef CAIRO_HAS_SPECTRE */

/* Define to 1 to enable cairo's symbol-lookup feature */
/* #undef CAIRO_HAS_SYMBOL_LOOKUP */

/* Define to 1 to enable cairo's test surfaces feature */
/* #undef CAIRO_HAS_TEST_SURFACES */

/* Define to 1 to enable cairo's cairo-trace feature */
#define CAIRO_HAS_TRACE 1

/* Define to 1 to disable certain code paths that rely heavily on double
   precision floating-point calculation */
/* #undef DISABLE_SOME_FLOATING_POINT */

/* Define to 1 if your system stores words within floats with the most
   significant word first */
/* #undef FLOAT_WORDS_BIGENDIAN */

/* Enable pixman glyph cache */
#define HAS_PIXMAN_GLYPHS 1

/* Define to 1 if you have the `alarm' function. */
#define HAVE_ALARM 1

/* Define to 1 if you have the binutils development files installed */
/* #undef HAVE_BFD */

/* Define to 1 if your compiler supports the __builtin_return_address()
   intrinsic. */
#define HAVE_BUILTIN_RETURN_ADDRESS 1

/* Define to 1 if you have the <byteswap.h> header file. */
#define HAVE_BYTESWAP_H 1

/* Define to 1 if you have the `clock_gettime' function. */
#define HAVE_CLOCK_GETTIME 1

/* Define to 1 if you have the `ctime_r' function. */
#define HAVE_CTIME_R 1

/* Define to 1 if you have the <dlfcn.h> header file. */
#define HAVE_DLFCN_H 1

/* Define to 1 if you have the `drand48' function. */
#define HAVE_DRAND48 1

/* Define to 1 if you have the `FcFini' function. */
#define HAVE_FCFINI 1

/* Define to 1 if you have the `FcInit' function. */
#define HAVE_FCINIT 1

/* Define to 1 if you have the <fcntl.h> header file. */
#define HAVE_FCNTL_H 1

/* Define to 1 if you have the `feclearexcept' function. */
#define HAVE_FECLEAREXCEPT 1

/* Define to 1 if you have the `fedisableexcept' function. */
#define HAVE_FEDISABLEEXCEPT 1

/* Define to 1 if you have the `feenableexcept' function. */
#define HAVE_FEENABLEEXCEPT 1

/* Define to 1 if you have the <fenv.h> header file. */
#define HAVE_FENV_H 1

/* Define to 1 if you have the `flockfile' function. */
#define HAVE_FLOCKFILE 1

/* Define to 1 if you have the `fork' function. */
#define HAVE_FORK 1

/* Define to 1 if you have the `FT_Get_X11_Font_Format' function. */
#define HAVE_FT_GET_X11_FONT_FORMAT 1

/* Define to 1 if you have the `FT_GlyphSlot_Embolden' function. */
#define HAVE_FT_GLYPHSLOT_EMBOLDEN 1

/* Define to 1 if you have the `FT_GlyphSlot_Oblique' function. */
#define HAVE_FT_GLYPHSLOT_OBLIQUE 1

/* Define to 1 if you have the `FT_Library_SetLcdFilter' function. */
#define HAVE_FT_LIBRARY_SETLCDFILTER 1

/* Define to 1 if you have the `FT_Load_Sfnt_Table' function. */
#define HAVE_FT_LOAD_SFNT_TABLE 1

/* Define to 1 if you have the `funlockfile' function. */
#define HAVE_FUNLOCKFILE 1

/* Whether you have gcov */
/* #undef HAVE_GCOV */

/* Define to 1 if you have the `getline' function. */
#define HAVE_GETLINE 1

/* Enable if your compiler supports the Intel __sync_* atomic primitives */
#define HAVE_INTEL_ATOMIC_PRIMITIVES 1

/* Define to 1 if you have the <inttypes.h> header file. */
#define HAVE_INTTYPES_H 1

/* Define to 1 if you have the <io.h> header file. */
/* #undef HAVE_IO_H */

/* Define to 1 if you have the <libgen.h> header file. */
#define HAVE_LIBGEN_H 1

/* Define to 1 if you have the `rt' library (-lrt). */
#define HAVE_LIBRT 1

/* Enable if you have libatomic-ops-dev installed */
/* #undef HAVE_LIB_ATOMIC_OPS */

/* Define to 1 if you have the `link' function. */
#define HAVE_LINK 1

/* Define to 1 if you have the Valgrind lockdep tool */
/* #undef HAVE_LOCKDEP */

/* Define to 1 if you have lzo available */
/* #undef HAVE_LZO */

/* Define to 1 if you have the Valgrind memfault tool */
/* #undef HAVE_MEMFAULT */

/* Define to 1 if you have the <memory.h> header file. */
#define HAVE_MEMORY_H 1

/* Define to non-zero if your system has mkdir, and to 2 if your version of
   mkdir requires a mode parameter */
#define HAVE_MKDIR 2

/* Define to 1 if you have the `mmap' function. */
#define HAVE_MMAP 1

/* Enable if you have MacOS X atomic operations */
/* #undef HAVE_OS_ATOMIC_OPS */

/* Define to 1 if you have the `poppler_page_render' function. */
/* #undef HAVE_POPPLER_PAGE_RENDER */

/* Define to 1 if you have the `raise' function. */
#define HAVE_RAISE 1

/* Define to 1 if you have the `rsvg_pixbuf_from_file' function. */
/* #undef HAVE_RSVG_PIXBUF_FROM_FILE */

/* Define to 1 if you have the `sched_getaffinity' function. */
#define HAVE_SCHED_GETAFFINITY 1

/* Define to 1 if you have the <sched.h> header file. */
#define HAVE_SCHED_H 1

/* Define to 1 if you have the <setjmp.h> header file. */
#define HAVE_SETJMP_H 1

/* Define to 1 if you have the <signal.h> header file. */
#define HAVE_SIGNAL_H 1

/* Define to 1 if you have the <stdint.h> header file. */
#define HAVE_STDINT_H 1

/* Define to 1 if you have the <stdlib.h> header file. */
#define HAVE_STDLIB_H 1

/* Define to 1 if you have the <strings.h> header file. */
#define HAVE_STRINGS_H 1

/* Define to 1 if you have the <string.h> header file. */
#define HAVE_STRING_H 1

/* Define to 1 if you have the `strndup' function. */
#define HAVE_STRNDUP 1

/* Define to 1 if you have the <sys/int_types.h> header file. */
/* #undef HAVE_SYS_INT_TYPES_H */

/* Define to 1 if you have the <sys/ioctl.h> header file. */
#define HAVE_SYS_IOCTL_H 1

/* Define to 1 if you have the <sys/mman.h> header file. */
#define HAVE_SYS_MMAN_H 1

/* Define to 1 if you have the <sys/poll.h> header file. */
#define HAVE_SYS_POLL_H 1

/* Define to 1 if you have the <sys/socket.h> header file. */
#define HAVE_SYS_SOCKET_H 1

/* Define to 1 if you have the <sys/stat.h> header file. */
#define HAVE_SYS_STAT_H 1

/* Define to 1 if you have the <sys/types.h> header file. */
#define HAVE_SYS_TYPES_H 1

/* Define to 1 if you have the <sys/un.h> header file. */
#define HAVE_SYS_UN_H 1

/* Define to 1 if you have the <sys/wait.h> header file. */
#define HAVE_SYS_WAIT_H 1

/* Define to 1 if you have the <time.h> header file. */
#define HAVE_TIME_H 1

/* Define to 1 if the system has the type `uint128_t'. */
/* #undef HAVE_UINT128_T */

/* Define to 1 if the system has the type `uint64_t'. */
#define HAVE_UINT64_T 1

/* Define to 1 if you have the <unistd.h> header file. */
#define HAVE_UNISTD_H 1

/* Define to 1 if you have Valgrind */
/* #undef HAVE_VALGRIND */

/* Define to 1 if you have the `waitpid' function. */
#define HAVE_WAITPID 1

/* Define to 1 if you have the <windows.h> header file. */
/* #undef HAVE_WINDOWS_H */

/* Define to 1 if you have the <X11/extensions/shmproto.h> header file. */
#define HAVE_X11_EXTENSIONS_SHMPROTO_H 1

/* Define to 1 if you have the <X11/extensions/shmstr.h> header file. */
#define HAVE_X11_EXTENSIONS_SHMSTR_H 1

/* Define to 1 if you have the <X11/extensions/XShm.h> header file. */
#define HAVE_X11_EXTENSIONS_XSHM_H 1

/* Define to 1 if you have the `XRenderCreateConicalGradient' function. */
#define HAVE_XRENDERCREATECONICALGRADIENT 1

/* Define to 1 if you have the `XRenderCreateLinearGradient' function. */
#define HAVE_XRENDERCREATELINEARGRADIENT 1

/* Define to 1 if you have the `XRenderCreateRadialGradient' function. */
#define HAVE_XRENDERCREATERADIALGRADIENT 1

/* Define to 1 if you have zlib available */
#define HAVE_ZLIB 1

/* Define to 1 if the system has the type `__uint128_t'. */
#define HAVE___UINT128_T 1

/* Define to 1 if shared memory segments are released deferred. */
#define IPC_RMID_DEFERRED_RELEASE 1

/* Define to the sub-directory in which libtool stores uninstalled libraries.
   */
#define LT_OBJDIR ".libs/"

/* Define to 1 if your C compiler doesn't accept -c and -o together. */
/* #undef NO_MINUS_C_MINUS_O */

/* Define to the address where bug reports for this package should be sent. */
#define PACKAGE_BUGREPORT "http://bugs.freedesktop.org/enter_bug.cgi?product=cairo"

/* Define to the full name of this package. */
#define PACKAGE_NAME USE_cairo_INSTEAD

/* Define to the full name and version of this package. */
#define PACKAGE_STRING USE_cairo_version_OR_cairo_version_string_INSTEAD

/* Define to the one symbol short name of this package. */
#define PACKAGE_TARNAME USE_cairo_INSTEAD

/* Define to the home page for this package. */
#define PACKAGE_URL "http://cairographics.org/"

/* Define to the version of this package. */
#define PACKAGE_VERSION USE_cairo_version_OR_cairo_version_string_INSTEAD

/* Shared library file extension */
#define SHARED_LIB_EXT "so"

/* The size of `int', as computed by sizeof. */
#define SIZEOF_INT 4

/* The size of `long', as computed by sizeof. */
#define SIZEOF_LONG 8

/* The size of `long long', as computed by sizeof. */
#define SIZEOF_LONG_LONG 8

/* The size of `size_t', as computed by sizeof. */
#define SIZEOF_SIZE_T 8

/* The size of `void *', as computed by sizeof. */
#define SIZEOF_VOID_P 8

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


/* Define to the value your compiler uses to support the warn-unused-result
   attribute */
#define WARN_UNUSED_RESULT __attribute__((__warn_unused_result__))

/* Define WORDS_BIGENDIAN to 1 if your processor stores words with the most
   significant byte first (like Motorola and SPARC, unlike Intel). */
#if defined AC_APPLE_UNIVERSAL_BUILD
# if defined __BIG_ENDIAN__
#  define WORDS_BIGENDIAN 1
# endif
#else
# ifndef WORDS_BIGENDIAN
/* #  undef WORDS_BIGENDIAN */
# endif
#endif


/* Deal with multiple architecture compiles on Mac OS X */
#ifdef __APPLE_CC__
#ifdef __BIG_ENDIAN__
#define WORDS_BIGENDIAN 1
#define FLOAT_WORDS_BIGENDIAN 1
#else
/* #undef WORDS_BIGENDIAN */
/* #undef FLOAT_WORDS_BIGENDIAN */
#endif
#endif


/* Define to 1 if the X Window System is missing or not being used. */
/* #undef X_DISPLAY_MISSING */

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

/* Define to `__inline__' or `__inline' if that's what the C compiler
   calls it, or to nothing if 'inline' is not supported under any name.  */
#ifndef __cplusplus
/* #undef inline */
#endif

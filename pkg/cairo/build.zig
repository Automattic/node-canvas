const std = @import("std");
const sources = @import("sources.zig");

pub fn build(b: *std.Build) !void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    const cairo = b.dependency("cairo", .{});

    const lib = b.addLibrary(.{
        .name = "cairo",
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
            .link_libc = true,
            .pic = true,
        }),
    });

    lib.link_data_sections = true;
    lib.link_function_sections = true;
    lib.addIncludePath(cairo.path("src"));

    var cairo_sources = std.ArrayList([]const u8).empty;
    defer cairo_sources.deinit(b.allocator);

    try cairo_sources.appendSlice(b.allocator, sources.cairo);

    var c_flags = std.ArrayList([]const u8).empty;
    defer c_flags.deinit(b.allocator);
    try c_flags.appendSlice(b.allocator, &.{
        "-Wmissing-declarations",
        "-Werror-implicit-function-declaration",
        "-Wpointer-arith",
        "-Wwrite-strings",
        "-Wsign-compare",
        "-Wpacked",
        "-Wswitch-enum",
        "-Wmissing-format-attribute",
        "-Wvolatile-register-var",
        "-Wstrict-aliasing=2",
        "-Winit-self",
        // "-Wunsafe-loop-optimizations",
        "-Wno-missing-field-initializers",
        "-Wno-unused-parameter",
        "-Wno-attributes",
        "-Wno-long-long",
        "-Winline",
        "-Wno-unused-but-set-variable",
        "-Wno-enum-conversion",
        "-fno-strict-aliasing",
        "-fno-common",
        "-D_GNU_SOURCE",
        "-DCAIRO_COMPILATION",
        "-fno-sanitize=undefined",
    });
    if (optimize != .Debug) {
        try c_flags.append(b.allocator, "-Wp,-D_FORTIFY_SOURCE=2");
    }

    const config = b.addConfigHeader(.{}, .{
        .HAVE_STDINT_H = 1,
        .HAVE_INTTYPES_H = 1,
        .HAVE_FCNTL_H = 1,
        .HAVE_UNISTD_H = 1,
        .HAVE_TIME_H = 1,
        .HAVE_LIBGEN_H = 1,
        .HAVE_SIGNAL_H = 1,
        .HAVE_SETJMP_H = 1,
        .HAVE_SYS_STAT_H = 1,
        .HAVE_UINT64_T = 1,
        .HAVE_ALARM = 1,
        .HAVE_GETLINE = 1,
        .HAVE_RAISE = 1,
        .HAVE_STRTOD_L = 1,
        .HAVE_CLOCK_GETTIME = 1,
        .HAVE_C11_ATOMIC_PRIMITIVES = 1,
        // 2 means variant 2 (see meson-cc-tests/mkdir-variant-2.c)
        // aka `int mkdir(const char *, mode_t)`
        .HAVE_MKDIR = 2,
        .SIZEOF_VOID_P = target.result.ptrBitWidth() / 8,
        .SIZEOF_INT = target.result.cTypeByteSize(.int),
        .SIZEOF_LONG = target.result.cTypeByteSize(.long),
        .SIZEOF_LONG_LONG = target.result.cTypeByteSize(.longlong),
        .SIZEOF_SIZE_T = target.result.ptrBitWidth() / 8,
    });

    // not checking the real source of truth here, but works in practice
    if (target.result.ptrBitWidth() == 64) {
        config.addValues(.{
            .HAVE___UINT128_T = 1,
        });
    }

    if (target.result.os.tag == .windows)
        config.addValues(.{
            .HAVE_INTSAFE_H = 1,
        })
    else
        config.addValues(.{
            .HAVE_SYS_SOCKET_H = 1,
            .HAVE_POLL_H = 1,
            .HAVE_SYS_POLL_H = 1,
            .HAVE_SYS_UN_H = 1,
            .HAVE_SCHED_H = 1,
            .HAVE_SYS_MMAN_H = 1,
            .HAVE_SYS_IOCTL_H = 1,
            .HAVE_TERMIOS_H = 1,
            .HAVE_DRAND48 = 1,
            .HAVE_LINK = 1,
            .HAVE_FORK = 1,
            .HAVE_NEWLOCALE = 1,
            .HAVE_STRNDUP = 1,
            .HAVE_MMAP = 1,
            .HAVE_CTIME_R = 1,
            .HAVE_LOCALTIME_R = 1,
            .HAVE_GMTIME_R = 1,
        });

    if (target.result.os.tag == .linux or target.result.cpu.arch.isWasm())
        config.addValues(.{
            .HAVE_BYTESWAP_H = 1,
            .HAVE_FENV_H = 1,
            .HAVE_SYS_WAIT_H = 1,
            .HAVE_ALLOCA_H = 1,
            .HAVE_FLOCKFILE = 1,
            .HAVE_FUNLOCKFILE = 1,
            .HAVE_SCHED_GETAFFINITY = 1,
        });

    if (target.result.os.tag.isDarwin())
        config.addValues(.{ .HAVE_XLOCALE_H = 1 })
    else
        config.addValues(.{ .HAVE_IO_H = 1 });

    if (target.result.os.tag.isDarwin() or target.result.os.tag == .linux)
        config.addValues(.{ .HAVE_WAITPID = 1 });

    if (target.result.cpu.arch.endian() == .big)
        config.addValues(.{
            .WORDS_BIGENDIAN = 1,
            .FLOAT_WORDS_BIGENDIAN = 1,
        });

    const feature_config = b.addConfigHeader(.{ .include_path = "cairo-features.h" }, .{});

    lib.linkSystemLibrary("m");

    const zlib = b.dependency("zlib", .{
            .target = target,
            .optimize = optimize,
    });

    lib.linkLibrary(zlib.artifact("z"));

    config.addValues(.{
        .HAVE_ZLIB = 1,
        .CAIRO_HAS_INTERPRETER = 1,
        .CAIRO_CAN_TEST_PS_SURFACE = 1,
    });
    feature_config.addValues(.{
        .CAIRO_HAS_PS_SURFACE = 1,
        .CAIRO_HAS_PDF_SURFACE = 1,
        .CAIRO_HAS_SCRIPT_SURFACE = 1,
    });

    try cairo_sources.appendSlice(b.allocator, sources.script_surface);
    const png = b.dependency("libpng", .{
        .target = target,
        .optimize = optimize,
    });

    lib.linkLibrary(png.artifact("png"));

    config.addValues(.{
        .CAIRO_CAN_TEST_SVG_SURFACE = 1,
    });
    feature_config.addValues(.{
        .CAIRO_HAS_SVG_SURFACE = 1,
        .CAIRO_HAS_PNG_FUNCTIONS = 1,
    });

    try cairo_sources.appendSlice(b.allocator, sources.png);

    const freetype = b.dependency("freetype", .{
        .target = target,
        .optimize = optimize,
    }).artifact("freetype");
    lib.linkLibrary(freetype);
    lib.installLibraryHeaders(freetype);

    feature_config.addValues(.{ .CAIRO_HAS_FT_FONT = 1 });
    config.addValues(.{
        .HAVE_FT_LOAD_NO_SVG = 1,
        .HAVE_FT_SVG_DOCUMENT = 1,
        .HAVE_FT_COLR_V1 = 1,
    });

    try cairo_sources.appendSlice(b.allocator, sources.freetype);

    if (target.result.os.tag == .windows) {
        try c_flags.appendSlice(b.allocator, &.{
            "-DWIN32_LEAN_AND_MEAN",
            "-DNOMINMAX",
            "-DCAIRO_WIN32_STATIC_BUILD",
        });

        lib.linkSystemLibrary("gdi32");
        lib.linkSystemLibrary("msimg32");

        feature_config.addValues(.{
            .CAIRO_HAS_WIN32_SURFACE = 1,
            .CAIRO_HAS_WIN32_FONT = 1,
        });
    }

    if (b.systemIntegrationOption("pixman", .{})) {
        lib.linkSystemLibrary("pixman-1");
    } else if (b.lazyDependency("pixman", .{
        .target = target,
        .optimize = optimize,
    })) |dep| {
        const pixman = dep.artifact("pixman");
        pixman.root_module.sanitize_c = .off;
        lib.linkLibrary(pixman);
        lib.installLibraryHeaders(pixman);
    }

    feature_config.addValues(.{ .CAIRO_HAS_IMAGE_SURFACE = 1 });
    config.addValues(.{ .HAS_PIXMAN_GLYPHS = 1 });

    feature_config.addValues(.{
        .CAIRO_HAS_USER_FONT = 1,
        .CAIRO_HAS_MIME_SURFACE = 1,
        .CAIRO_HAS_RECORDING_SURFACE = 1,
        .CAIRO_HAS_OBSERVER_SURFACE = 1,
    });

    lib.linkSystemLibrary("pthread");

    config.addValues(.{
        .CAIRO_HAS_PTHREAD = 1,
        .CAIRO_HAS_REAL_PTHREAD = 1,
    });

    try c_flags.appendSlice(b.allocator, &.{
        "-pthread",
        "-D_REENTRANT",
    });

    if (!target.result.cpu.arch.isX86())
        config.addValues(.{ .ATOMIC_OP_NEEDS_MEMORY_BARRIER = 1 });

    lib.addConfigHeader(config);
    lib.addConfigHeader(feature_config);

    lib.addCSourceFiles(.{
        .root = cairo.path("src"),
        .files = try cairo_sources.toOwnedSlice(b.allocator),
        .flags = c_flags.items,
    });

    lib.installHeadersDirectory(cairo.path("src"), "", .{});
    lib.installConfigHeader(config);
    lib.installConfigHeader(feature_config);

    b.installArtifact(lib);
}

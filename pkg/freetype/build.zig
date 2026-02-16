const std = @import("std");

pub fn build(b: *std.Build) !void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const upstream = b.dependency("freetype", .{});
    const lib = b.addLibrary(.{
        .name = "freetype",
        .linkage = .static,
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
            .link_libc = true,
        }),
    });

    lib.addIncludePath(upstream.path("include"));
    lib.installHeadersDirectory(upstream.path("include"), "", .{});

    // Dependencies
    const zlib_dep = b.dependency("zlib", .{ .target = target, .optimize = optimize });
    lib.root_module.linkLibrary(zlib_dep.artifact("z"));

    const libpng_dep = b.dependency("libpng", .{ .target = target, .optimize = optimize });
    lib.root_module.linkLibrary(libpng_dep.artifact("png"));

    var flags: std.ArrayList([]const u8) = .empty;
    defer flags.deinit(b.allocator);

    try flags.appendSlice(b.allocator, &.{
        "-DFT2_BUILD_LIBRARY",

        "-DFT_CONFIG_OPTION_SYSTEM_ZLIB",
        "-DFT_CONFIG_OPTION_USE_PNG",

        "-DHAVE_UNISTD_H",
        "-DHAVE_FCNTL_H",

        "-fno-sanitize=undefined",
    });

    lib.root_module.addCSourceFiles(.{
        .root = upstream.path(""),
        .files = srcs,
        .flags = flags.items,
    });

    switch (target.result.os.tag) {
        .linux => lib.root_module.addCSourceFile(.{
            .file = upstream.path("builds/unix/ftsystem.c"),
            .flags = flags.items,
        }),
        .windows => lib.root_module.addCSourceFile(.{
            .file = upstream.path("builds/windows/ftsystem.c"),
            .flags = flags.items,
        }),
        else => lib.root_module.addCSourceFile(.{
            .file = upstream.path("src/base/ftsystem.c"),
            .flags = flags.items,
        }),
    }
    switch (target.result.os.tag) {
        .windows => {
            lib.root_module.addCSourceFile(.{
                .file = upstream.path("builds/windows/ftdebug.c"),
                .flags = flags.items,
            });
            lib.root_module.addWin32ResourceFile(.{
                .file = upstream.path("src/base/ftver.rc"),
            });
        },
        else => lib.root_module.addCSourceFile(.{
            .file = upstream.path("src/base/ftdebug.c"),
            .flags = flags.items,
        }),
    }

    b.installArtifact(lib);
}

const srcs: []const []const u8 = &.{
    "src/autofit/autofit.c",
    "src/base/ftbase.c",
    "src/base/ftbbox.c",
    "src/base/ftbdf.c",
    "src/base/ftbitmap.c",
    "src/base/ftcid.c",
    "src/base/ftfstype.c",
    "src/base/ftgasp.c",
    "src/base/ftglyph.c",
    "src/base/ftgxval.c",
    "src/base/ftinit.c",
    "src/base/ftmm.c",
    "src/base/ftotval.c",
    "src/base/ftpatent.c",
    "src/base/ftpfr.c",
    "src/base/ftstroke.c",
    "src/base/ftsynth.c",
    "src/base/fttype1.c",
    "src/base/ftwinfnt.c",
    "src/bdf/bdf.c",
    "src/bzip2/ftbzip2.c",
    "src/cache/ftcache.c",
    "src/cff/cff.c",
    "src/cid/type1cid.c",
    "src/gzip/ftgzip.c",
    "src/lzw/ftlzw.c",
    "src/pcf/pcf.c",
    "src/pfr/pfr.c",
    "src/psaux/psaux.c",
    "src/pshinter/pshinter.c",
    "src/psnames/psnames.c",
    "src/raster/raster.c",
    "src/sdf/sdf.c",
    "src/sfnt/sfnt.c",
    "src/smooth/smooth.c",
    "src/svg/svg.c",
    "src/truetype/truetype.c",
    "src/type1/type1.c",
    "src/type42/type42.c",
    "src/winfonts/winfnt.c",
};

const std = @import("std");

pub fn build(b: *std.Build) !void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const plutovg = b.addLibrary(.{
        .name = "plutovg",
        .linkage = .static,
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
        })
    });

    const upstream = b.dependency("lunasvg", .{});
    const cairo = b.dependency("cairo", .{
        .target = target,
        .optimize = optimize,
    }).artifact("cairo");

    plutovg.addCSourceFiles(.{
        .root = upstream.path(""),
        .files = &.{
            "plutovg/source/plutovg-blend.c",
            "plutovg/source/plutovg-canvas.c",
            "plutovg/source/plutovg-font.c",
            "plutovg/source/plutovg-matrix.c",
            "plutovg/source/plutovg-path.c",
            "plutovg/source/plutovg-paint.c",
            "plutovg/source/plutovg-rasterize.c",
            "plutovg/source/plutovg-surface.c",
            "plutovg/source/plutovg-ft-math.c",
            "plutovg/source/plutovg-ft-raster.c",
            "plutovg/source/plutovg-ft-stroker.c"
        },
        .flags = &.{
            "-D_FILE_OFFSET_BITS=64",
            "-std=gnu11",
            "-pthread",
            "-DWITH_GZFILEOP",
            "-DPLUTOVG_BUILD",
            "-DPLUTOVG_BUILD_STATIC",
            "-DHAVE_THREADS_H",
            "-fvisibility=hidden",
        }
    });

    plutovg.addIncludePath(upstream.path("plutovg/include"));
    plutovg.installHeadersDirectory(upstream.path("plutovg/include"), "", .{});
    plutovg.linkLibrary(cairo);
    plutovg.linkLibC();

    // strip out anything we didn't use, which for plutovg is a lot (on this fork)
    plutovg.link_data_sections = true;
    plutovg.link_function_sections = true;

    const lunasvg = b.addLibrary(.{
        .name = "lunasvg",
        .linkage = .static,
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
        })
    });

    lunasvg.addCSourceFiles(.{
        .root = upstream.path(""),
        .files = &.{
            "source/lunasvg.cpp",
            "source/graphics.cpp",
            "source/svgelement.cpp",
            "source/svggeometryelement.cpp",
            "source/svgpaintelement.cpp",
            "source/svgparser.cpp",
            "source/svgproperty.cpp",
            "source/svglayoutstate.cpp",
            "source/svgrenderstate.cpp",
            "source/svgtextelement.cpp"
        },
        .flags = &.{
            "-D_GLIBCXX_ASSERTIONS=1",
            "-D_FILE_OFFSET_BITS=64",
            "-std=c++17",
            "-DWITH_GZFILEOP",
            "-pthread",
            "-DLUNASVG_BUILD",
            "-DLUNASVG_BUILD_STATIC",
            "-DPLUTOVG_BUILD_STATIC",
            "-fvisibility=hidden",
        }
    });

    // strip out anything we didn't use
    lunasvg.link_data_sections = true;
    lunasvg.link_function_sections = true;

    lunasvg.addIncludePath(upstream.path("include"));
    lunasvg.installHeadersDirectory(upstream.path("include"), "", .{});
    lunasvg.linkLibrary(plutovg);
    lunasvg.linkLibC();
    lunasvg.linkLibCpp();
    lunasvg.linkLibrary(cairo);

    b.installArtifact(lunasvg);
}

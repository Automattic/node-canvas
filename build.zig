const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    const cairo = b.dependency("cairo", .{
        .use_spectre = false,
        .use_xlib = false,
        .use_xcb = false,
        .use_png = true,
        .use_glib = false,
        .use_dwrite = false,
        .use_fontconfig = false,
        .use_freetype = false,
        .use_quartz = false,
        .target = target,
        .optimize = optimize,
    }).artifact("cairo");

    const libjpeg_turbo = b.dependency("libjpeg_turbo", .{
        .target = target,
        .optimize = optimize,
    }).artifact("libjpeg_turbo");
    
    const giflib = b.dependency("giflib", .{
        .target = target,
        .optimize = optimize,
    }).artifact("giflib");
    
    const libpng = b.dependency("libpng", .{
        .target = target,
        .optimize = optimize,
    }).artifact("png");

    const canvas = b.addLibrary(.{
      .name = "canvas",
      .linkage = .dynamic,
      .root_module = b.createModule(.{
        .target = target,
        .optimize = optimize,
      })
    });
    
    const node_api = b.dependency("node_api", .{
        .target = target,
        .optimize = optimize,
    }).artifact("node_api");

    canvas.addCSourceFiles(.{
        .files = &.{
            "src/bmp/BMPParser.cc",
            "src/Canvas.cc",
            "src/CanvasGradient.cc",
            "src/CanvasPattern.cc",
            "src/CanvasRenderingContext2d.cc",
            "src/closure.cc",
            "src/color.cc",
            "src/Image.cc",
            "src/ImageData.cc",
            "src/init.cc",
            "src/FontParser.cc"
        } ,
        .flags = &.{
            "-DNAPI_DISABLE_CPP_EXCEPTIONS",
            "-DNODE_ADDON_API_ENABLE_MAYBE",
            if (target.result.os.tag == .windows) "-DCAIRO_WIN32_STATIC_BUILD" else "",
        }
    });

    canvas.linker_allow_shlib_undefined = true;

    canvas.linkLibC();
    canvas.linkLibCpp();
    canvas.addObject(node_api);
    canvas.linkLibrary(cairo);
    canvas.linkLibrary(libjpeg_turbo);
    canvas.linkLibrary(libpng);
    canvas.linkLibrary(giflib);
    
    const move = b.addInstallFile(canvas.getEmittedBin(), "../bin/canvas.node");
    move.step.dependOn(&canvas.step);
    b.getInstallStep().dependOn(&move.step);
}

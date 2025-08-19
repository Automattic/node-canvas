const std = @import("std");

// mirror changes here with bindings.js
fn outputPath(target: std.Build.ResolvedTarget) []const u8 {
    const os = target.result.os.tag;
    const arch = target.result.cpu.arch;
    const abi = target.result.abi;

    switch (os) {
        .macos => switch (arch) {
            .aarch64 => return "../npm/darwin-arm64/canvas.node",
            .x86_64 => return "../npm/darwin-x64/canvas.node",
            else => {},
        },
        .linux => switch (arch) {
            .arm => switch (abi) {
                .gnueabihf => return "../npm/linux-arm-gnueabihf/canvas.node",
                else => {},
            },
            .x86 => switch (abi) {
                .gnu => return "../npm/linux-x86-gnu/canvas.node",
                .musl => return "../npm/linux-x86-musl/canvas.node",
                else => {},
            },
            .aarch64 => switch (abi) {
                .gnu => return "../npm/linux-arm64-gnu/canvas.node",
                .musl => return "../npm/linux-arm64-musl/canvas.node",
                else => {},
            },
            .riscv64 => switch (abi) {
                .gnu => return "../npm/linux-riscv64-gnu/canvas.node",
                else => {},
            },
            .x86_64 => switch (abi) {
                .gnu => return "../npm/linux-x64-gnu/canvas.node",
                .musl => return "../npm/linux-x64-musl/canvas.node",
                else => {},
            },
            else => {},
        },
        .windows => switch (arch) {
            .aarch64 => return "../npm/win32-arm64/canvas.node",
            .x86_64 => return "../npm/win32-x64/canvas.node",
            .x86 => return "../npm/win32-x86/canvas.node",
            else => {},
        },
        else => {},
    }

    return "../bin/canvas.node";
}

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    const cairo = b.dependency("cairo", .{
        .target = target,
        .optimize = optimize,
    }).artifact("cairo");

    const libjpeg_turbo = b.dependency("libjpeg_turbo", .{
        .target = target,
        .optimize = optimize,
        .pie = true,
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

    if (optimize != .Debug) {
        canvas.root_module.strip = true;
    }

    canvas.linkLibC();
    canvas.linkLibCpp();
    canvas.addObject(node_api);
    canvas.linkLibrary(cairo);
    canvas.linkLibrary(libjpeg_turbo);
    canvas.linkLibrary(libpng);
    canvas.linkLibrary(giflib);
    
    const move = b.addInstallFile(canvas.getEmittedBin(), outputPath(target));
    move.step.dependOn(&canvas.step);
    b.getInstallStep().dependOn(&move.step);
}

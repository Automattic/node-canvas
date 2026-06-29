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

    const sheenbidi = b.dependency("sheenbidi", .{
        .target = target,
        .optimize = optimize,
    }).artifact("sheenbidi");

    const zg = b.dependency("zg", .{
        .target = target,
        .optimize = optimize,
    });

    const harfbuzz = b.dependency("harfbuzz", .{
        .target = target,
        .optimize = optimize,
    }).artifact("harfbuzz");

    const lunasvg = b.dependency("lunasvg", .{
        .target = target,
        .optimize = optimize,
    }).artifact("lunasvg");

    const unicode = b.addLibrary(.{
        .name = "unicode",
        .linkage = .static,
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
            .root_source_file = b.path("src/unicode.zig"),
        })
    });

    unicode.root_module.addImport("Scripts", zg.module("Scripts"));
    unicode.root_module.addImport("Graphemes", zg.module("Graphemes"));
    unicode.linkLibC();

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
            "src/itemize.cc",
            "src/FontManager.cc",
            switch (target.result.os.tag) {
                .windows => "src/FontManagerWindows.cc",
                .macos => "src/FontManagerMacos.cc",
                else => "src/FontManagerLinux.cc",
            },
            "src/FontFace.cc",
            "src/FontFaceSet.cc",
            "src/FontParser.cc",
            "src/FontLayout.cc"
        } ,
        .flags = &.{
            "-DNAPI_DISABLE_CPP_EXCEPTIONS",
            "-DNODE_ADDON_API_ENABLE_MAYBE",
            "-D_USE_MATH_DEFINES",
            "-std=c++20",
            // dlclose gets called on the addon
            // https://maskray.me/blog/2024-03-17-c++-exit-time-destructors
            "-fno-c++-static-destructors",
            if (target.result.os.tag == .windows) "-DCAIRO_WIN32_STATIC_BUILD" else "",
            "-DLUNASVG_BUILD_STATIC",
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
    canvas.linkLibrary(sheenbidi);
    canvas.linkLibrary(unicode);
    canvas.linkLibrary(harfbuzz);
    canvas.linkLibrary(lunasvg);

    // some deps, especially lunasvg, compile with -ffunction-sections and
    // -fdata-sections so we don't have to distribute unused parts of libraries
    canvas.link_gc_sections = true;

    if (target.result.os.tag == .windows) {
        canvas.linkSystemLibrary("dwrite");
    }

    if (target.result.os.tag == .macos) {
        // Stole this method from
        // https://github.com/ghostty-org/ghostty/commit/c0722b3652e5e207f34d220f64a03d9d53e93ad0

        // The active SDK we want to use
        const sdk = "MacOSX15.sdk";

        // Get the path to our active Xcode installation. If this fails then
        // the zig build will fail.
        const path = std.mem.trim(
            u8,
            b.run(&.{ "xcode-select", "--print-path" }),
            " \r\n",
        );

        canvas.addSystemFrameworkPath(.{
            .cwd_relative = b.pathJoin(&.{
                path,
                "Platforms/MacOSX.platform/Developer/SDKs/" ++ sdk ++ "/System/Library/Frameworks",
            }),
        });
        canvas.addSystemIncludePath(.{
            .cwd_relative = b.pathJoin(&.{
                path,
                "Platforms/MacOSX.platform/Developer/SDKs/" ++ sdk ++ "/usr/include",
            }),
        });
        canvas.addLibraryPath(.{
            .cwd_relative = b.pathJoin(&.{
                path,
                "Platforms/MacOSX.platform/Developer/SDKs/" ++ sdk ++ "/usr/lib",
            }),
        });
    }

    const move = b.addInstallFile(canvas.getEmittedBin(), outputPath(target));
    move.step.dependOn(&canvas.step);
    b.getInstallStep().dependOn(&move.step);
}

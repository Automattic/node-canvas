const std = @import("std");

pub fn build(b: *std.Build) !void {
    const upstream = b.dependency("harfbuzz", .{});
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const harfbuzz = b.addLibrary(.{
        .name = "harfbuzz",
        .linkage = .static,
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
        })
    });

    harfbuzz.addCSourceFile(.{
        .file = upstream.path("src/harfbuzz.cc"),
    });
    harfbuzz.installHeadersDirectory(upstream.path("src"), "", .{});

    harfbuzz.linkLibC();
    harfbuzz.linkLibCpp();

    b.installArtifact(harfbuzz);
}

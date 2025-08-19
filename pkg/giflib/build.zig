const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const giflib = b.addLibrary(.{
      .name = "giflib",
      .linkage = .static,
      .root_module = b.createModule(.{
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .pic = true,
      })
    });

    const upstream = b.dependency("giflib", .{});
    
    giflib.root_module.addCSourceFiles(.{
        .root = upstream.path("."),
        .files = &.{
            "dgif_lib.c",
            "egif_lib.c",
            "gifalloc.c",
            "gif_err.c",
            "gif_font.c",
            "gif_hash.c",
            "openbsd-reallocarray.c",
        } ,
        .flags = &.{
            "-std=gnu99",
            "-Wall",
            "-Wno-format-truncation",
        }
    });
    
    giflib.installHeadersDirectory(upstream.path("."), "", .{});

    b.installArtifact(giflib);
}

const std = @import("std");

pub fn build(b: *std.Build) !void {
    const upstream = b.dependency("pixman", .{});

    const lib = b.addLibrary(.{
        .name = "pixman",
        .root_module = b.createModule(.{
            .target = b.standardTargetOptions(.{}),
            .optimize = b.standardOptimizeOption(.{}),
        }),
    });

    lib.linkLibC();
    lib.root_module.addCMacro("HAVE_CONFIG_H", "1");

    const config_h = b.addConfigHeader(.{
        .include_path = "config.h",
    }, .{
        // Required to make pixman-private.h
        .PACKAGE = "FOO",
        .HAVE_PTHREADS = "1",
    });
    lib.addConfigHeader(config_h);

    lib.addIncludePath(upstream.path("pixman"));
    lib.installHeadersDirectory(upstream.path("pixman"), "", .{});
    lib.addCSourceFiles(.{
        .root = upstream.path("pixman"),
        .files = sources,
    });

    b.installArtifact(lib);
}

const sources = &.{
    "pixman.c",
    "pixman-access.c",
    "pixman-access-accessors.c",
    "pixman-bits-image.c",
    "pixman-combine32.c",
    "pixman-combine-float.c",
    "pixman-conical-gradient.c",
    "pixman-filter.c",
    "pixman-x86.c",
    "pixman-mips.c",
    "pixman-arm.c",
    "pixman-ppc.c",
    "pixman-edge.c",
    "pixman-edge-accessors.c",
    "pixman-fast-path.c",
    "pixman-glyph.c",
    "pixman-general.c",
    "pixman-gradient-walker.c",
    "pixman-image.c",
    "pixman-implementation.c",
    "pixman-linear-gradient.c",
    "pixman-matrix.c",
    "pixman-noop.c",
    "pixman-radial-gradient.c",
    "pixman-region16.c",
    "pixman-region32.c",
    "pixman-solid-fill.c",
    "pixman-timer.c",
    "pixman-trap.c",
    "pixman-utils.c",
};

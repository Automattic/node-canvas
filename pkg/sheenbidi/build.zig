const std = @import("std");

pub fn build(b: *std.Build) !void {
    const upstream = b.dependency("sheenbidi", .{});
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const sheenbidi = b.addLibrary(.{
        .name = "sheenbidi",
        .linkage = .static,
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
        })
    });

    sheenbidi.addCSourceFile(.{
        .file = upstream.path("Source/SheenBidi.c"),
        .flags = &.{"-DSB_CONFIG_UNITY"},
    });

    sheenbidi.addIncludePath(upstream.path("Headers"));
    sheenbidi.installHeadersDirectory(upstream.path("Headers"), "", .{});
    sheenbidi.linkLibC();

    b.installArtifact(sheenbidi);
}
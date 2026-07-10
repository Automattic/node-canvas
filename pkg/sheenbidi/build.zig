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
            .pic = true,
            .link_libc = true,
        })
    });

    sheenbidi.root_module.addCSourceFile(.{
        .file = upstream.path("Source/SheenBidi.c"),
        .flags = &.{"-DSB_CONFIG_UNITY"},
    });

    sheenbidi.root_module.addIncludePath(upstream.path("Headers"));
    sheenbidi.installHeadersDirectory(upstream.path("Headers"), "", .{});

    b.installArtifact(sheenbidi);
}

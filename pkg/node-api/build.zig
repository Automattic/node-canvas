const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    const node_api_headers = b.dependency("node_api_headers", .{});
    const node_api = b.addLibrary(.{
        .name = "node_api",
        .linkage = .static,
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
        })
    });
    
    // so that upstream people can call linkLibrary
    node_api.addCSourceFile(.{.file = b.path("empty.c"), .flags = &.{}});

    node_api.installHeadersDirectory(node_api_headers.path("include"), "", .{});
    
    if (target.result.os.tag == .windows) {
        const node_api_lib = dlltool(b, target, node_api_headers.path("def/node_api.def"), "node_api.lib");
        const js_native_api_lib = dlltool(b, target, node_api_headers.path("def/js_native_api.def"), "js_native_api.lib");
        node_api.addObjectFile(node_api_lib);
        node_api.addObjectFile(js_native_api_lib);
    }
    
    b.installArtifact(node_api);

    const move = b.addInstallFile(canvas.getEmittedBin(), "../bin/canvas.node");
    move.step.dependOn(&canvas.step);
    b.getInstallStep().dependOn(&move.step);
}

pub fn dlltool(
    b: *std.Build,
    target: std.Build.ResolvedTarget,
    def_file: std.Build.LazyPath,
    lib_file_basename: []const u8
) std.Build.LazyPath {
    const exe = b.addSystemCommand(&.{b.graph.zig_exe, "dlltool", "-d", def_file.getPath(b), "-l"});
    const lib_file = exe.addOutputFileArg(lib_file_basename);
    
    exe.addArgs(&.{
        "-m", switch (target.result.cpu.arch) {
            .x86 => "i386",
            .x86_64 => "i386:x86-64",
            .arm => "arm",
            .aarch64 => "arm64",
            else => "i386:x86-64",
        },
    });
    
    return lib_file;
}
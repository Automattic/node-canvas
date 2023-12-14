const fs = require("fs");
const path = require("path");
const glob = require("glob");
const pkg = require("../package.json");

const root = path.join(__dirname, "..");
const pkgs = path.join(root, "packages");

const { version } = pkg;
const { name, triples: triples_ } = pkg.napi;
const triples = triples_.additional;

const TARGET_INFO = {
    "aarch64-apple-darwin": {
        os: ["darwin"],
        cpu: ["arm64"],
        main: "canvas.darwin-arm64.node",
    },
    "x86_64-apple-darwin": {
        os: ["darwin"],
        cpu: ["x64"],
        main: "canvas.darwin-x64.node",
    },
    "aarch64-linux-android": {
        os: ["android"],
        cpu: ["arm64"],
        main: "canvas.android-arm64.node",
    },
    "aarch64-unknown-linux-gnu": {
        os: ["linux"],
        cpu: ["arm64"],
        libc: ["glibc"],
        main: "canvas.linux-arm64-gnu.node",
    },
    "aarch64-unknown-linux-musl": {
        os: ["linux"],
        cpu: ["arm64"],
        libc: ["musl"],
        main: "canvas.linux-arm64-musl.node",
    },
    "aarch64-pc-windows-msvc": {
        os: ["win32"],
        cpu: ["arm64"],
        main: "canvas.win32-arm64-msvc.node",
    },
    "armv7-unknown-linux-gnueabihf": {
        os: ["linux"],
        cpu: ["arm"],
        main: "canvas.linux-arm-gnueabihf.node",
    },
    "x86_64-unknown-linux-gnu": {
        os: ["linux"],
        cpu: ["x64"],
        libc: ["glibc"],
        main: "canvas.linux-x64-gnu.node",
    },
    "x86_64-unknown-linux-musl": {
        os: ["linux"],
        cpu: ["x64"],
        libc: ["musl"],
        main: "canvas.linux-x64-musl.node",
    },
    "i686-pc-windows-msvc": {
        os: ["win32"],
        cpu: ["ia32"],
        main: "canvas.win32-ia32-msvc.node",
    },
    "x86_64-pc-windows-msvc": {
        os: ["win32"],
        cpu: ["x64"],
        main: "canvas.win32-x64-msvc.node",
    },
    "armv7-linux-androideabi": {
        os: ["android"],
        cpu: ["arm"],
        main: "canvas.android-arm-eabi.node",
    },
};

for (const item of glob.globSync(path.join(pkgs, "*"))) {
    if (fs.statSync(item).isDirectory()) {
        fs.rmSync(item, { recursive: true });
    }
}

for (const triple of triples) {
    const dir = path.join(pkgs, triple);
    const info = TARGET_INFO[triple];

    fs.mkdirSync(dir);

    const data = {
        name: "@node-canvas/canvas-" + triple,
        version,
        files: [info.main],
        license: "MIT",
        engines: {
            node: ">= 10",
        },
        ...info,
    };

    fs.writeFileSync(
        path.join(dir, "package.json"),
        JSON.stringify(data, null, 4)
    );
}

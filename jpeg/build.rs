extern crate bindgen;

use std::env;
use std::path::PathBuf;
use std::process::Command;

use bindgen::{Builder, CargoCallbacks};

fn build_from_source() {
    Command::new("bash")
        .arg("build_libjpeg.sh")
        .output()
        .expect("Could not spawn bash!");
}

fn main() {
    println!("cargo:rustc-link-search=/usr/lib/x86_64-linux-gnu");
    println!("cargo:rustc-link-search=/usr/lib/aarch64-linux-gnu");
    println!("cargo:rustc-link-search=./libjpeg-install/lib");

    println!("cargo:rustc-link-lib=jpeg");
    println!("cargo:rerun-if-changed=wrapper.hpp");

    if let Ok(var) = env::var("BUILD_FROM_SOURCE") {
        if var == "1" {
            build_from_source();
        }
    }

    let bindings = Builder::default()
        .header("wrapper.hpp")
        .parse_callbacks(Box::new(CargoCallbacks))
        .generate()
        .expect("Unable to generate bindings!");

    let out_path = PathBuf::from(env::var("OUT_DIR").unwrap());

    bindings
        .write_to_file(out_path.join("bindings.rs"))
        .expect("Couldn't write bindings!");
}

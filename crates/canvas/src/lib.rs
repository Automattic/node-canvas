#![allow(clippy::module_inception)]

#[macro_use]
extern crate anyhow;

#[macro_use]
extern crate concat_idents;

#[macro_use]
extern crate serde;

#[macro_use]
extern crate bitflags;

#[macro_use]
extern crate canvas_macros;

pub mod canvas;
pub mod config;
pub mod context;
pub mod create;
pub mod dom;
pub mod format;
pub mod image;
pub mod text;
pub mod util;

#[cfg(test)]
pub mod test;

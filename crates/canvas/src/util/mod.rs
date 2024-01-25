use std::{convert::AsMut, ops::Mul};

use napi::bindgen_prelude::Either3;

use crate::config::{jpeg::JpegConfig, pdf::PdfConfig, png::PngConfig};

pub mod expose;
pub mod macros;

pub type StringOption = Option<String>;
pub type BufferConfig = Option<Either3<PngConfig, JpegConfig, PdfConfig>>;

/// See https://stackoverflow.com/a/37679442
pub fn clone_into_array<A, T>(slice: &[T]) -> A
where
    A: Sized + Default + AsMut<[T]>,
    T: Clone,
{
    let mut a = Default::default();
    <A as AsMut<[T]>>::as_mut(&mut a).clone_from_slice(slice);
    a
}

pub fn multiply_slices<const N: usize, T>(mut a: [T; N], b: [T; N]) -> [T; N]
where
    T: Mul<Output = T> + Copy,
{
    for i in 0..a.len() {
        a[i] = a[i] * b[i];
    }

    a
}

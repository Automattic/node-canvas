use super::{jpeg::JpegConfig, pdf::PdfConfig, png::PngConfig};
use napi::bindgen_prelude::Either3;

pub type BufferConfig = Either3<PngConfig, JpegConfig, PdfConfig>;

use napi::bindgen_prelude::Either3;
use super::{png::PngConfig, jpeg::JpegConfig, pdf::PdfConfig};

pub type BufferConfig = Either3<PngConfig, JpegConfig, PdfConfig>;

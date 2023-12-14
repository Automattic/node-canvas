use napi::bindgen_prelude::{Buffer, Either3};

use crate::{
    config::{buffer::BufferConfig, png::PngConfig},
    image::kind::ImageKind,
};

#[napi]
#[derive(
    Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize,
)]
pub struct Canvas {
    pub width: i32,
    pub height: i32,
    pub stride: i32,

    #[napi(js_name = "type")]
    pub kind: ImageKind,
}

#[napi]
impl Canvas {
    #[napi(constructor)]
    pub fn new(width: i32, height: i32, kind: Option<ImageKind>) -> Self {
        Self {
            width,
            height,
            kind: kind.unwrap_or_default(),
            stride: 0,
        }
    }

    #[napi]
    pub fn to_buffer(&self, mime: Option<String>, config: Option<BufferConfig>) -> Buffer {
        let _mime = mime.unwrap_or(String::from("image/png"));
        let _config = config.unwrap_or(Either3::A(PngConfig::default()));

        todo!()
    }

    #[napi]
    pub fn get_context(&self, #[napi(ts_arg_type = "\"2d\" | \"webgl\" | \"webgl2\"")] id: String) {
        match id.as_str() {
            "2d" => (),
            "webgl" => (),
            "webgl2" => (),

            _ => panic!("Unknown context ID: {}", id),
        }
    }
}

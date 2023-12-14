use napi::bindgen_prelude::{Buffer, Either3};
use raqote::DrawTarget;

use crate::{
    config::{jpeg::JpegConfig, pdf::PdfConfig, png::PngConfig},
    context::context::CanvasRenderingContext2d,
    image::kind::ImageKind,
};

#[napi]
#[derive(Debug, Clone)]
pub struct Canvas {
    pub width: i32,
    pub height: i32,
    pub stride: i32,

    #[napi(js_name = "type")]
    pub kind: ImageKind,

    pub(crate) target: DrawTarget,
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
            target: DrawTarget::new(width, height),
        }
    }

    #[napi]
    pub fn to_buffer(
        &self,
        mime: Option<String>,
        config: Option<Either3<PngConfig, JpegConfig, PdfConfig>>,
    ) -> Buffer {
        let _mime = mime.unwrap_or(String::from("image/png"));
        let _config = config.unwrap_or(Either3::A(PngConfig::default()));

        // TODO: Implementation
        Buffer::from(vec![])
    }

    #[napi]
    pub fn get_context(
        &self,
        #[napi(ts_arg_type = "\"2d\" | \"webgl\" | \"webgl2\"")] id: String,
    ) -> CanvasRenderingContext2d {
        match id.as_str() {
            "2d" => CanvasRenderingContext2d::new(self),
            "webgl" | "webgl2" => panic!("Unsupported context type!"),

            _ => panic!("Unknown context ID: {}", id),
        }
    }
}

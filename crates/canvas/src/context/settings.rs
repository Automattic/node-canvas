use crate::canvas::format::PixelFormat;

#[napi]
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct ContextSettings {
    pub alpha: bool,

    #[napi(js_name = "pixelFormat")]
    pub pixel_format: Option<PixelFormat>,
}

#[napi]
impl ContextSettings {
    #[napi(constructor)]
    pub fn new(alpha: Option<bool>, pixel_format: Option<PixelFormat>) -> Self {
        Self {
            alpha: alpha.unwrap_or(false),
            pixel_format,
        }
    }
}

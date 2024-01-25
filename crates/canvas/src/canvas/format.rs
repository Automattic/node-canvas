#[conditional_napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum PixelFormat {
    #[default]
    Rgba32,
    Rgb24,
    A8,
    Rgb16_565,
    A1,
    Rgb30,
}

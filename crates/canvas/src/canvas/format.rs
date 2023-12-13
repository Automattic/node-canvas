#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum PixelFormat {
    Rgba32,
    Rgb24,
    A8,
    Rgb16_565,
    A1,
    Rgb30,
}

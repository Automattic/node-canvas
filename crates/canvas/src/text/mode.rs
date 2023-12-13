#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum TextDrawingMode {
    Path,
    Glyph,
}

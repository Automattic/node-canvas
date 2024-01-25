#[conditional_napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum TextDrawingMode {
    #[default]
    Path,
    Glyph,
}

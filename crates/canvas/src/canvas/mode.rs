#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum AliasingMode {
    Default,
    None,
    Gray,
    Subpixel,
}

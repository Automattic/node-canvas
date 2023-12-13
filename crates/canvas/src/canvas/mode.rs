#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum AliasingMode {
    #[default]
    Default,
    None,
    Gray,
    Subpixel,
}

#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum Quality {
    Fast,
    #[default]
    Good,
    Best,
    Nearest,
    Bilinear,
}

#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum Quality {
    Fast,
    Good,
    Best,
    Nearest,
    Bilinear,
}

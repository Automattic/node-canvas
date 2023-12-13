#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum TextAlign {
    Center,
    End,
    Left,
    Right,
    Start,
}

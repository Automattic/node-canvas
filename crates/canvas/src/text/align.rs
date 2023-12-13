#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum TextAlign {
    Center,
    End,
    Left,
    Right,
    #[default]
    Start,
}

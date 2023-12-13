#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum TextBaseline {
    Alphabetic,
    Bottom,
    Hanging,
    Ideographic,
    Middle,
    Top,
}

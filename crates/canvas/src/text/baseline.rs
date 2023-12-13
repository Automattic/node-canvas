#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum TextBaseline {
    #[default]
    Alphabetic,
    Bottom,
    Hanging,
    Ideographic,
    Middle,
    Top,
}

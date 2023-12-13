#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum Repetition {
    Repeat,
    RepeatX,
    RepeatY,
    NoRepeat,
    None,
}

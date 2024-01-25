#[conditional_napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum Repetition {
    #[default]
    Repeat,
    RepeatX,
    RepeatY,
    NoRepeat,
    None,
}

#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum FillRule {
    #[default]
    EvenOdd,
    NonZero,
}

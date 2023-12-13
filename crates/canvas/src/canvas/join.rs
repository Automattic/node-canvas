#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum LineJoin {
    Bevel,
    #[default]
    Miter,
    Round,
}

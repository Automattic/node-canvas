#[conditional_napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum LineJoin {
    Bevel,
    #[default]
    Miter,
    Round,
}

impl LineJoin {
    pub fn into_raqote(&self) -> raqote::LineJoin {
        match *self {
            LineJoin::Bevel => raqote::LineJoin::Bevel,
            LineJoin::Miter => raqote::LineJoin::Miter,
            LineJoin::Round => raqote::LineJoin::Round,
        }
    }
}

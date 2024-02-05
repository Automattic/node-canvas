#[napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum LineCap {
    #[default]
    Butt,
    Round,
    Square,
}

impl LineCap {
    pub fn into_raqote(&self) -> raqote::LineCap {
        match *self {
            LineCap::Butt => raqote::LineCap::Butt,
            LineCap::Round => raqote::LineCap::Round,
            LineCap::Square => raqote::LineCap::Square,
        }
    }
}

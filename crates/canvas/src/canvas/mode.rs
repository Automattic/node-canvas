use raqote::AntialiasMode;

#[conditional_napi]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum AliasingMode {
    #[default]
    Default,
    None,
    Gray,
    Subpixel,
}

impl AliasingMode {
    pub fn into_raqote(&self) -> AntialiasMode {
        match *self {
            AliasingMode::Default | AliasingMode::Gray => AntialiasMode::Gray,
            AliasingMode::None => AntialiasMode::None,
            AliasingMode::Subpixel => panic!("Raqote does not suppoort subpixel mode!"),
        }
    }
}

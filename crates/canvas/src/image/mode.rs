bitflags! {
    #[napi]
    #[repr(transparent)]
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
    pub struct ImageMode: u8 {
        const Image = 0;
        const Mime = 1;
    }
}

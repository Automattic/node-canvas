bitflags! {
    #[napi]
    #[repr(transparent)]
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
    pub struct ImageMode: u32 {
        const Image = 0b00000001;
        const Mime  = 0b00000010;
    }
}

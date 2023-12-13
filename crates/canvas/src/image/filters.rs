bitflags! {
    #[napi]
    #[repr(transparent)]
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
    pub struct PngFilters: u32 {
        const NoFilters = 0b00000001;
        const All       = 0b00000010;
        const None      = 0b00000100;
        const Sub       = 0b00001000;
        const Up        = 0b00010000;
        const Avg       = 0b00100000;
        const Paeth     = 0b01000000;
    }
}

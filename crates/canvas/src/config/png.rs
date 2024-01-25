use crate::image::filters::PngFilters;

#[conditional_napi(object)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct PngConfig {
    pub compression_level: u8,
    pub filters: PngFilters,
    pub palette: Option<Vec<u8>>,
    pub background_index: i32,
    pub resolution: Option<u32>,
}

#[conditional_napi]
impl Default for PngConfig {
    fn default() -> Self {
        Self {
            compression_level: 6,
            filters: PngFilters::All,
            palette: None,
            background_index: 0,
            resolution: None,
        }
    }
}

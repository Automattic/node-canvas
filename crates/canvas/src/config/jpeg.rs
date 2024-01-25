#[conditional_napi(object)]
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
pub struct JpegConfig {
    pub quality: f64,
    pub progressive: bool,
    pub chroma_subsampling: bool,
}

#[conditional_napi]
impl Default for JpegConfig {
    fn default() -> Self {
        Self {
            quality: 0.75,
            progressive: false,
            chroma_subsampling: true,
        }
    }
}

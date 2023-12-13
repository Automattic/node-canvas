#[napi(object)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct TextMetrics {
    /// actualBoundingBoxAscent
    #[napi(js_name = "actualBoundingBoxAscent")]
    pub abb_ascent: i32,

    /// actualBoundingBoxDescent
    #[napi(js_name = "actualBoundingBoxDescent")]
    pub abb_descent: i32,

    /// actualBoundingBoxLeft
    #[napi(js_name = "actualBoundingBoxLeft")]
    pub abb_left: i32,

    /// actualBoundingBoxRight
    #[napi(js_name = "actualBoundingBoxRight")]
    pub abb_right: i32,

    /// fontBoundingBoxAscent
    #[napi(js_name = "fontBoundingBoxAscent")]
    pub fbb_ascent: i32,

    /// fontBoundingBoxDescent
    #[napi(js_name = "fontBoundingBoxDescent")]
    pub fbb_descent: i32,
    pub width: i32,
}

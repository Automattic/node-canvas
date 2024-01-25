#[conditional_napi(object)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct TextMetrics {
    pub actual_bounding_box_ascent: i32,
    pub actual_bounding_box_descent: i32,
    pub actual_bounding_box_left: i32,
    pub actual_bounding_box_right: i32,
    pub font_bounding_box_ascent: i32,
    pub font_bounding_box_descent: i32,
    pub width: i32,
}

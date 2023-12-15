#[napi(object)]
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
pub struct DomPoint {
    pub w: Option<f64>,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub z: Option<f64>,
}

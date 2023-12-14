#[napi(js_name = "DOMPoint")]
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
pub struct DomPoint {
    pub w: f64,
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

#[napi]
impl DomPoint {
    #[napi(constructor)]
    pub fn new(w: Option<f64>, x: Option<f64>, y: Option<f64>, z: Option<f64>) -> Self {
        Self {
            w: w.unwrap_or(0.0),
            x: x.unwrap_or(0.0),
            y: y.unwrap_or(0.0),
            z: z.unwrap_or(0.0),
        }
    }
}

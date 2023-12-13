#[napi]
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct DomPoint {
    pub w: i32,
    pub x: i32,
    pub y: i32,
    pub z: i32,
}

#[napi]
impl DomPoint {
    #[napi(constructor)]
    pub fn new(w: Option<i32>, x: Option<i32>, y: Option<i32>, z: Option<i32>) -> Self {
        Self {
            w: w.unwrap_or(0),
            x: x.unwrap_or(0),
            y: y.unwrap_or(0),
            z: z.unwrap_or(0),
        }
    }
}

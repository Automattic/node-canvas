use napi::bindgen_prelude::{Float32Array, Float64Array};

use super::DomMatrix;

#[napi]
impl DomMatrix {
    #[napi]
    pub fn from_array(init: Vec<f64>) -> Self {
        Self::from(init)
    }

    #[napi]
    pub fn from_string(init: String) -> Self {
        Self::from(init)
    }

    #[napi]
    #[allow(clippy::clone_on_copy)]
    pub fn from_matrix(other: &DomMatrix) -> Self {
        other.clone()
    }

    #[napi]
    pub fn from_float32_array(arr: Float32Array) -> Self {
        Self::from(arr)
    }

    #[napi]
    pub fn from_float64_array(arr: Float64Array) -> Self {
        Self::from(arr)
    }
}

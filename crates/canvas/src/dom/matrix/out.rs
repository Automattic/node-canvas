use napi::bindgen_prelude::{Float32Array, Float64Array};

use super::DomMatrix;

#[napi]
impl DomMatrix {
    #[napi]
    pub fn to_float32_array(&self) -> Float32Array {
        Float32Array::new(
            self.values()
                .iter()
                .map(|v| *v as f32)
                .collect::<Vec<f32>>(),
        )
    }

    #[napi]
    pub fn to_float64_array(&self) -> Float64Array {
        Float64Array::new(self.values().to_vec())
    }
}

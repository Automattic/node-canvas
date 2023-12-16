use napi::bindgen_prelude::{Float32Array, Float64Array};

use super::DomMatrix;

impl DomMatrix {
    pub fn to_f32_array(&self) -> Float32Array {
        Float32Array::new(
            self.values()
                .iter()
                .map(|v| *v as f32)
                .collect::<Vec<f32>>(),
        )
    }

    pub fn to_f64_array(&self) -> Float64Array {
        Float64Array::new(self.values().to_vec())
    }
}

use std::f64::consts::PI;

use napi::bindgen_prelude::{Float32Array, Float64Array};

use crate::alias_property;

use super::point::DomPoint;

pub mod changes;
pub mod from;
pub mod macros;
pub mod ops;
pub mod parse;
pub mod util;

pub const DEG_PER_RAD: f64 = 180.0 / PI;
pub const RAD_PER_DEG: f64 = PI / 180.0;

#[napi]
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Default, Serialize, Deserialize)]
pub struct DomMatrix {
    #[napi(js_name = "is2D")]
    pub is_2d: bool,
    pub m11: f64,
    pub m12: f64,
    pub m13: f64,
    pub m14: f64,
    pub m21: f64,
    pub m22: f64,
    pub m23: f64,
    pub m24: f64,
    pub m31: f64,
    pub m32: f64,
    pub m33: f64,
    pub m34: f64,
    pub m41: f64,
    pub m42: f64,
    pub m43: f64,
    pub m44: f64,
}

#[napi]
impl DomMatrix {
    #[napi(constructor)]
    pub fn new(init: Vec<f64>) -> Self {
        Self::from(init)
    }

    #[napi(factory)]
    pub fn from_array(init: Vec<f64>) -> Self {
        Self::from(init)
    }

    #[napi(factory)]
    pub fn from_string(init: String) -> Self {
        Self::from(init)
    }

    #[napi(getter)]
    pub fn values(&self) -> [f64; 16] {
        [
            self.m11, self.m12, self.m13, self.m14, self.m21, self.m22, self.m23, self.m24,
            self.m31, self.m32, self.m33, self.m34, self.m41, self.m42, self.m43, self.m44,
        ]
    }

    // TODO: napi
    #[napi]
    pub fn set_values(&mut self, values: Vec<f64>) {
        self.m11 = values[0];
        self.m12 = values[1];
        self.m13 = values[2];
        self.m14 = values[3];
        self.m21 = values[4];
        self.m22 = values[5];
        self.m23 = values[6];
        self.m24 = values[7];
        self.m31 = values[8];
        self.m32 = values[9];
        self.m33 = values[10];
        self.m34 = values[11];
        self.m41 = values[12];
        self.m42 = values[13];
        self.m43 = values[14];
        self.m44 = values[15];
    }

    #[napi]
    pub fn transform_point(&self, point: &DomPoint) -> DomPoint {
        let DomPoint { w, x, y, z } = point;

        let x = self.m11 * x + self.m21 * y + self.m31 * z + self.m41 * w;
        let y = self.m12 * x + self.m22 * y + self.m32 * z + self.m42 * w;
        let z = self.m13 * x + self.m23 * y + self.m33 * z + self.m43 * w;
        let w = self.m14 * x + self.m24 * y + self.m34 * z + self.m44 * w;

        DomPoint { x, y, z, w }
    }

    #[napi(js_name = "toFloat32Array")]
    pub fn to_f32_array(&self) -> Float32Array {
        Float32Array::new(
            self.values()
                .iter()
                .map(|v| *v as f32)
                .collect::<Vec<f32>>(),
        )
    }

    #[napi(js_name = "toFloat64Array")]
    pub fn to_f64_array(&self) -> Float64Array {
        Float64Array::new(self.values().to_vec())
    }

    #[napi(getter, writable = false)]
    pub fn is_identity(&self) -> bool {
        self.m11 == 1.0
            && self.m12 == 0.0
            && self.m13 == 0.0
            && self.m14 == 0.0
            && self.m21 == 0.0
            && self.m22 == 1.0
            && self.m23 == 0.0
            && self.m24 == 0.0
            && self.m31 == 0.0
            && self.m32 == 0.0
            && self.m33 == 1.0
            && self.m34 == 0.0
            && self.m41 == 0.0
            && self.m42 == 0.0
            && self.m43 == 0.0
            && self.m44 == 1.0
    }
}

alias_property!(DomMatrix, f64, a, m11);
alias_property!(DomMatrix, f64, b, m12);
alias_property!(DomMatrix, f64, c, m21);
alias_property!(DomMatrix, f64, d, m22);
alias_property!(DomMatrix, f64, e, m41);
alias_property!(DomMatrix, f64, f, m42);

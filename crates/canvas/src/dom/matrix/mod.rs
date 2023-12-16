use crate::alias_property;
use std::f64::consts::PI;

pub mod convert;
pub mod flip;
pub mod from;
pub mod inverse;
pub mod ops;
pub mod out;
pub mod parse;
pub mod point;
pub mod rotate;
pub mod scale;
pub mod skew;
pub mod transform;
pub mod translate;
pub mod values;

#[cfg(test)]
pub mod tests;

pub const RAD_TO_DEG: f64 = 180.0 / PI;
pub const DEG_TO_RAD: f64 = PI / 180.0;
pub const PI_360: f64 = PI / 360.0;

#[napi]
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Default, Serialize, Deserialize)]
pub struct DomMatrix {
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

impl DomMatrix {
    pub fn new(init: Option<Vec<f64>>) -> Self {
        if let Some(init) = init {
            Self::from(init)
        } else {
            Self::identity()
        }
    }

    pub fn identity() -> Self {
        Self {
            m11: 1.0,
            m12: 0.0,
            m13: 0.0,
            m14: 0.0,
            m21: 0.0,
            m22: 1.0,
            m23: 0.0,
            m24: 0.0,
            m31: 0.0,
            m32: 0.0,
            m33: 1.0,
            m34: 0.0,
            m41: 0.0,
            m42: 0.0,
            m43: 0.0,
            m44: 1.0,
        }
    }

    pub fn is_identity(&self) -> bool {
        self.values().eq(&Self::identity().values())
    }

    pub fn is_2d(&self) -> bool {
        self.m31 == 0.0
            && self.m32 == 0.0
            && self.m33 == 1.0
            && self.m34 == 0.0
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

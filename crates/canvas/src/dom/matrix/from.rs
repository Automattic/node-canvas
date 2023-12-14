use crate::util::clone_into_array;

use super::DomMatrix;

#[napi]
impl From<Box<[f64]>> for DomMatrix {
    fn from(value: Box<[f64]>) -> Self {
        Self::from(value.to_vec())
    }
}

#[napi]
impl From<Vec<f64>> for DomMatrix {
    fn from(value: Vec<f64>) -> Self {
        Self::from(value.as_slice())
    }
}

#[napi]
impl<'a> From<&'a [f64]> for DomMatrix {
    fn from(init: &'a [f64]) -> Self {
        if init.len() == 6 {
            Self::from(clone_into_array::<[f64; 6], f64>(&init[0..6]))
        } else if init.len() == 16 {
            Self::from(clone_into_array::<[f64; 16], f64>(&init[0..16]))
        } else {
            // No way to return an error :(
            Self::default()
        }
    }
}

#[napi]
impl From<[f64; 6]> for DomMatrix {
    fn from(init: [f64; 6]) -> Self {
        Self {
            is_2d: true,
            m11: init[0],
            m12: init[1],
            m13: 0.0,
            m14: 0.0,
            m21: init[2],
            m22: init[3],
            m23: 0.0,
            m24: 0.0,
            m31: 0.0,
            m32: 0.0,
            m33: 0.0,
            m34: 0.0,
            m41: init[4],
            m42: init[5],
            m43: 0.0,
            m44: 0.0,
        }
    }
}

#[napi]
impl From<[f64; 16]> for DomMatrix {
    fn from(init: [f64; 16]) -> Self {
        Self {
            is_2d: false,
            m11: init[0],
            m12: init[1],
            m13: init[2],
            m14: init[3],
            m21: init[4],
            m22: init[5],
            m23: init[6],
            m24: init[7],
            m31: init[8],
            m32: init[9],
            m33: init[10],
            m34: init[11],
            m41: init[12],
            m42: init[13],
            m43: init[14],
            m44: init[15],
        }
    }
}

#[napi]
impl From<[f32; 6]> for DomMatrix {
    fn from(value: [f32; 6]) -> Self {
        DomMatrix::from(value.map(|v| v as f64))
    }
}

#[napi]
impl From<[f32; 16]> for DomMatrix {
    fn from(value: [f32; 16]) -> Self {
        DomMatrix::from(value.map(|v| v as f64))
    }
}

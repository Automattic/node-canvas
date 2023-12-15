use euclid::default::{Transform3D, Transform2D};
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
            inner: Transform2D::from_array(init).to_3d()
        }
    }
}

#[napi]
impl From<[f64; 16]> for DomMatrix {
    fn from(init: [f64; 16]) -> Self {
        Self {
            inner: Transform3D::from_array(init)
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

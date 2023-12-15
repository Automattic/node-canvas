use std::f64::consts::PI;

use euclid::default::{Point2D, Point3D, Transform3D};
use napi::bindgen_prelude::{Float32Array, Float64Array};

use crate::alias_property;

use super::point::DomPoint;

pub mod changes;
pub mod from;
pub mod parse;
pub mod util;

pub const DEG_PER_RAD: f64 = 180.0 / PI;
pub const RAD_PER_DEG: f64 = PI / 180.0;

#[napi]
#[derive(Debug, Clone, Copy, PartialEq, Default, Serialize, Deserialize)]
pub struct DomMatrix {
    inner: Transform3D<f64>,
}

#[napi]
impl DomMatrix {
    #[napi(constructor)]
    pub fn new(init: Option<Vec<f64>>) -> Self {
        if let Some(init) = init {
            Self::from(init)
        } else {
            Self {
                inner: Transform3D::identity(),
            }
        }
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
            self.get_m11(),
            self.get_m12(),
            self.get_m13(),
            self.get_m14(),
            self.get_m21(),
            self.get_m22(),
            self.get_m23(),
            self.get_m24(),
            self.get_m31(),
            self.get_m32(),
            self.get_m33(),
            self.get_m34(),
            self.get_m41(),
            self.get_m42(),
            self.get_m43(),
            self.get_m44(),
        ]
    }

    #[napi]
    pub fn set_values(&mut self, values: Vec<f64>) {
        self.set_m11(values[0]);
        self.set_m12(values[1]);
        self.set_m13(values[2]);
        self.set_m14(values[3]);
        self.set_m21(values[4]);
        self.set_m22(values[5]);
        self.set_m23(values[6]);
        self.set_m24(values[7]);
        self.set_m31(values[8]);
        self.set_m32(values[9]);
        self.set_m33(values[10]);
        self.set_m34(values[11]);
        self.set_m41(values[12]);
        self.set_m42(values[13]);
        self.set_m43(values[14]);
        self.set_m44(values[15]);
    }

    #[napi]
    pub fn transform_point(&self, orig: DomPoint) -> DomPoint {
        if self.inner.is_2d()
            && (orig.z.is_none() || orig.z == Some(0.0) || orig.z == Some(0.0))
            && (orig.w.is_none() || orig.w == Some(1.0))
        {
            let point = Point2D::new(orig.x.unwrap_or(0.0), orig.y.unwrap_or(0.0));
            let point = self.inner.transform_point2d(point).unwrap();

            DomPoint {
                x: Some(point.x),
                y: Some(point.y),
                z: None,
                w: None,
            }
        } else {
            let point = Point3D::new(
                orig.x.unwrap_or(0.0),
                orig.y.unwrap_or(0.0),
                orig.z.unwrap_or(0.0),
            );
            let point = self.inner.transform_point3d(point).unwrap();

            DomPoint {
                x: Some(point.x),
                y: Some(point.y),
                z: Some(point.z),
                w: orig.w,
            }
        }
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
        self.inner.eq(&Transform3D::identity())
    }

    #[napi(getter, js_name = "is2D")]
    pub fn is_2d(&self) -> bool {
        self.inner.is_2d()
    }
}

alias_property!(DomMatrix, f64, m11, inner.m11);
alias_property!(DomMatrix, f64, m12, inner.m12);
alias_property!(DomMatrix, f64, m13, inner.m13);
alias_property!(DomMatrix, f64, m14, inner.m14);

alias_property!(DomMatrix, f64, m21, inner.m21);
alias_property!(DomMatrix, f64, m22, inner.m22);
alias_property!(DomMatrix, f64, m23, inner.m23);
alias_property!(DomMatrix, f64, m24, inner.m24);

alias_property!(DomMatrix, f64, m31, inner.m31);
alias_property!(DomMatrix, f64, m32, inner.m32);
alias_property!(DomMatrix, f64, m33, inner.m33);
alias_property!(DomMatrix, f64, m34, inner.m34);

alias_property!(DomMatrix, f64, m41, inner.m41);
alias_property!(DomMatrix, f64, m42, inner.m42);
alias_property!(DomMatrix, f64, m43, inner.m43);
alias_property!(DomMatrix, f64, m44, inner.m44);

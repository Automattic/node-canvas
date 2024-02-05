use crate::fix_zero;

use super::DomMatrix;

#[napi]
impl DomMatrix {
    #[napi]
    pub fn translate(&self, x: f64, y: Option<f64>, z: Option<f64>) -> Self {
        self.clone().translate_self(x, y, z)
    }

    #[napi]
    pub fn translate_self(&mut self, x: f64, y: Option<f64>, z: Option<f64>) -> Self {
        let y = y.unwrap_or(0.0);
        let z = z.unwrap_or(0.0);
        let mut tmp = Self::identity();

        tmp.m41 = fix_zero!(x);
        tmp.m42 = fix_zero!(y);
        tmp.m43 = fix_zero!(z);

        // Apparently MulAssign breaks this...?
        *self = tmp * *self;
        *self
    }
}

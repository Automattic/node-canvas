use std::ops::{Mul, MulAssign};

use crate::dom::matrix::DomMatrix;

impl DomMatrix {
    pub fn multiply(&self, other: DomMatrix) -> DomMatrix {
        self.clone().multiply_self(other)
    }

    pub fn multiply_self(&mut self, other: DomMatrix) -> DomMatrix {
        let m11 = other.m11 * self.m11
            + other.m12 * self.m21
            + other.m13 * self.m31
            + other.m14 * self.m41;

        let m12 = other.m11 * self.m12
            + other.m12 * self.m22
            + other.m13 * self.m32
            + other.m14 * self.m42;

        let m13 = other.m11 * self.m13
            + other.m12 * self.m23
            + other.m13 * self.m33
            + other.m14 * self.m43;

        let m14 = other.m11 * self.m14
            + other.m12 * self.m24
            + other.m13 * self.m34
            + other.m14 * self.m44;

        let m21 = other.m21 * self.m11
            + other.m22 * self.m21
            + other.m23 * self.m31
            + other.m24 * self.m41;

        let m22 = other.m21 * self.m12
            + other.m22 * self.m22
            + other.m23 * self.m32
            + other.m24 * self.m42;

        let m23 = other.m21 * self.m13
            + other.m22 * self.m23
            + other.m23 * self.m33
            + other.m24 * self.m43;

        let m24 = other.m21 * self.m14
            + other.m22 * self.m24
            + other.m23 * self.m34
            + other.m24 * self.m44;

        let m31 = other.m31 * self.m11
            + other.m32 * self.m21
            + other.m33 * self.m31
            + other.m34 * self.m41;

        let m32 = other.m31 * self.m12
            + other.m32 * self.m22
            + other.m33 * self.m32
            + other.m34 * self.m42;

        let m33 = other.m31 * self.m13
            + other.m32 * self.m23
            + other.m33 * self.m33
            + other.m34 * self.m43;

        let m34 = other.m31 * self.m14
            + other.m32 * self.m24
            + other.m33 * self.m34
            + other.m34 * self.m44;

        let m41 = other.m41 * self.m11
            + other.m42 * self.m21
            + other.m43 * self.m31
            + other.m44 * self.m41;

        let m42 = other.m41 * self.m12
            + other.m42 * self.m22
            + other.m43 * self.m32
            + other.m44 * self.m42;

        let m43 = other.m41 * self.m13
            + other.m42 * self.m23
            + other.m43 * self.m33
            + other.m44 * self.m43;

        let m44 = other.m41 * self.m14
            + other.m42 * self.m24
            + other.m43 * self.m34
            + other.m44 * self.m44;

        self.set_values(vec![
            m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44,
        ]);

        *self
    }
}

impl Mul for DomMatrix {
    type Output = Self;

    fn mul(self, rhs: Self) -> Self::Output {
        self.multiply(rhs)
    }
}

impl MulAssign for DomMatrix {
    fn mul_assign(&mut self, rhs: Self) {
        self.multiply_self(rhs);
    }
}

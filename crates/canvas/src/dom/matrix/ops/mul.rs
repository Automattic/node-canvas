use std::ops::{Mul, MulAssign};

use crate::{dom::matrix::DomMatrix, fix_zero};

impl DomMatrix {
    pub fn multiply(&self, other: DomMatrix) -> DomMatrix {
        self.clone().multiply_self(other)
    }

    pub fn multiply_self(&mut self, other: DomMatrix) -> DomMatrix {
        let m11 = self.m11 * other.m11
            + self.m12 * other.m21
            + self.m13 * other.m31
            + self.m14 * other.m41;

        let m12 = self.m11 * other.m12
            + self.m12 * other.m22
            + self.m13 * other.m32
            + self.m14 * other.m42;

        let m13 = self.m11 * other.m13
            + self.m12 * other.m23
            + self.m13 * other.m33
            + self.m14 * other.m43;

        let m14 = self.m11 * other.m14
            + self.m12 * other.m24
            + self.m13 * other.m34
            + self.m14 * other.m44;

        let m21 = self.m21 * other.m11
            + self.m22 * other.m21
            + self.m23 * other.m31
            + self.m24 * other.m41;

        let m22 = self.m21 * other.m12
            + self.m22 * other.m22
            + self.m23 * other.m32
            + self.m24 * other.m42;

        let m23 = self.m21 * other.m13
            + self.m22 * other.m23
            + self.m23 * other.m33
            + self.m24 * other.m43;

        let m24 = self.m21 * other.m14
            + self.m22 * other.m24
            + self.m23 * other.m34
            + self.m24 * other.m44;

        let m31 = self.m31 * other.m11
            + self.m32 * other.m21
            + self.m33 * other.m31
            + self.m34 * other.m41;

        let m32 = self.m31 * other.m12
            + self.m32 * other.m22
            + self.m33 * other.m32
            + self.m34 * other.m42;

        let m33 = self.m31 * other.m13
            + self.m32 * other.m23
            + self.m33 * other.m33
            + self.m34 * other.m43;

        let m34 = self.m31 * other.m14
            + self.m32 * other.m24
            + self.m33 * other.m34
            + self.m34 * other.m44;

        let m41 = self.m41 * other.m11
            + self.m42 * other.m21
            + self.m43 * other.m31
            + self.m44 * other.m41;

        let m42 = self.m41 * other.m12
            + self.m42 * other.m22
            + self.m43 * other.m32
            + self.m44 * other.m42;

        let m43 = self.m41 * other.m13
            + self.m42 * other.m23
            + self.m43 * other.m33
            + self.m44 * other.m43;

        let m44 = self.m41 * other.m14
            + self.m42 * other.m24
            + self.m43 * other.m34
            + self.m44 * other.m44;

        self.m11 = fix_zero!(m11);
        self.m12 = fix_zero!(m12);
        self.m13 = fix_zero!(m13);
        self.m14 = fix_zero!(m14);
        self.m21 = fix_zero!(m21);
        self.m22 = fix_zero!(m22);
        self.m23 = fix_zero!(m23);
        self.m24 = fix_zero!(m24);
        self.m31 = fix_zero!(m31);
        self.m32 = fix_zero!(m32);
        self.m33 = fix_zero!(m33);
        self.m34 = fix_zero!(m34);
        self.m41 = fix_zero!(m41);
        self.m42 = fix_zero!(m42);
        self.m43 = fix_zero!(m43);
        self.m44 = fix_zero!(m44);

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

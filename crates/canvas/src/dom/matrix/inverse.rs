use super::DomMatrix;

#[napi]
impl DomMatrix {
    #[napi]
    pub fn inverse(&self) -> Self {
        self.clone().invert_self()
    }

    #[napi]
    pub fn invert_self(&mut self) -> Self {
        let mut inv = Self::blank();

        inv.m11 = self.m22 * self.m33 * self.m44
            - self.m22 * self.m34 * self.m43
            - self.m32 * self.m23 * self.m44
            + self.m32 * self.m24 * self.m43
            + self.m42 * self.m23 * self.m34
            - self.m42 * self.m24 * self.m33;

        inv.m21 = -self.m21 * self.m33 * self.m44
            + self.m21 * self.m34 * self.m43
            + self.m31 * self.m23 * self.m44
            - self.m31 * self.m24 * self.m43
            - self.m41 * self.m23 * self.m34
            + self.m41 * self.m24 * self.m33;

        inv.m31 = self.m21 * self.m32 * self.m44
            - self.m21 * self.m34 * self.m42
            - self.m31 * self.m22 * self.m44
            + self.m31 * self.m24 * self.m42
            + self.m41 * self.m22 * self.m34
            - self.m41 * self.m24 * self.m32;

        inv.m41 = -self.m21 * self.m32 * self.m43
            + self.m21 * self.m33 * self.m42
            + self.m31 * self.m22 * self.m43
            - self.m31 * self.m23 * self.m42
            - self.m41 * self.m22 * self.m33
            + self.m41 * self.m23 * self.m32;

        let det = self.m11 * inv.m11 + self.m12 * inv.m21 + self.m13 * inv.m31 + self.m14 * inv.m41;

        if det == 0.0 {
            self.set_values([f64::NAN; 16].to_vec());
            return *self;
        }

        inv.m12 = -self.m12 * self.m33 * self.m44
            + self.m12 * self.m34 * self.m43
            + self.m32 * self.m13 * self.m44
            - self.m32 * self.m14 * self.m43
            - self.m42 * self.m13 * self.m34
            + self.m42 * self.m14 * self.m33;

        inv.m22 = self.m11 * self.m33 * self.m44
            - self.m11 * self.m34 * self.m43
            - self.m31 * self.m13 * self.m44
            + self.m31 * self.m14 * self.m43
            + self.m41 * self.m13 * self.m34
            - self.m41 * self.m14 * self.m33;

        inv.m32 = -self.m11 * self.m32 * self.m44
            + self.m11 * self.m34 * self.m42
            + self.m31 * self.m12 * self.m44
            - self.m31 * self.m14 * self.m42
            - self.m41 * self.m12 * self.m34
            + self.m41 * self.m14 * self.m32;

        inv.m42 = self.m11 * self.m32 * self.m43
            - self.m11 * self.m33 * self.m42
            - self.m31 * self.m12 * self.m43
            + self.m31 * self.m13 * self.m42
            + self.m41 * self.m12 * self.m33
            - self.m41 * self.m13 * self.m32;

        inv.m13 = self.m12 * self.m23 * self.m44
            - self.m12 * self.m24 * self.m43
            - self.m22 * self.m13 * self.m44
            + self.m22 * self.m14 * self.m43
            + self.m42 * self.m13 * self.m24
            - self.m42 * self.m14 * self.m23;

        inv.m23 = -self.m11 * self.m23 * self.m44
            + self.m11 * self.m24 * self.m43
            + self.m21 * self.m13 * self.m44
            - self.m21 * self.m14 * self.m43
            - self.m41 * self.m13 * self.m24
            + self.m41 * self.m14 * self.m23;

        inv.m33 = self.m11 * self.m22 * self.m44
            - self.m11 * self.m24 * self.m42
            - self.m21 * self.m12 * self.m44
            + self.m21 * self.m14 * self.m42
            + self.m41 * self.m12 * self.m24
            - self.m41 * self.m14 * self.m22;

        inv.m43 = -self.m11 * self.m22 * self.m43
            + self.m11 * self.m23 * self.m42
            + self.m21 * self.m12 * self.m43
            - self.m21 * self.m13 * self.m42
            - self.m41 * self.m12 * self.m23
            + self.m41 * self.m13 * self.m22;

        inv.m14 = -self.m12 * self.m23 * self.m34
            + self.m12 * self.m24 * self.m33
            + self.m22 * self.m13 * self.m34
            - self.m22 * self.m14 * self.m33
            - self.m32 * self.m13 * self.m24
            + self.m32 * self.m14 * self.m23;

        inv.m24 = self.m11 * self.m23 * self.m34
            - self.m11 * self.m24 * self.m33
            - self.m21 * self.m13 * self.m34
            + self.m21 * self.m14 * self.m33
            + self.m31 * self.m13 * self.m24
            - self.m31 * self.m14 * self.m23;

        inv.m34 = -self.m11 * self.m22 * self.m34
            + self.m11 * self.m24 * self.m32
            + self.m21 * self.m12 * self.m34
            - self.m21 * self.m14 * self.m32
            - self.m31 * self.m12 * self.m24
            + self.m31 * self.m14 * self.m22;

        inv.m44 = self.m11 * self.m22 * self.m33
            - self.m11 * self.m23 * self.m32
            - self.m21 * self.m12 * self.m33
            + self.m21 * self.m13 * self.m32
            + self.m31 * self.m12 * self.m23
            - self.m31 * self.m13 * self.m22;

        let vals = inv.values();

        self.set_values(vals.iter().map(|v| v / det).collect());
        *self
    }
}

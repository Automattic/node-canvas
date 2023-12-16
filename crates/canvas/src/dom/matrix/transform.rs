use crate::dom::point::DomPoint;

use super::DomMatrix;

impl DomMatrix {
    pub fn transform_point(&self, point: DomPoint) -> DomPoint {
        let x = point.x.unwrap_or(0.0);
        let y = point.y.unwrap_or(0.0);
        let z = point.z.unwrap_or(0.0);
        let w = point.w.unwrap_or(1.0);

        let x = self.m11 * x + self.m21 * y + self.m31 * z + self.m41 * w;
        let y = self.m12 * x + self.m22 * y + self.m32 * z + self.m42 * w;
        let z = self.m13 * x + self.m23 * y + self.m33 * z + self.m43 * w;
        let w = self.m14 * x + self.m24 * y + self.m34 * z + self.m44 * w;

        DomPoint {
            x: Some(x),
            y: Some(y),
            z: Some(z),
            w: Some(w),
        }
    }
}

use crate::dom::point::DomPoint;

use super::DomMatrix;

#[napi]
impl DomMatrix {
    #[napi]
    pub fn transform_point(&self, DomPoint { x, y, z, w }: DomPoint) -> DomPoint {
        let nx = self.m11 * x + self.m21 * y + self.m31 * z + self.m41 * w;
        let ny = self.m12 * x + self.m22 * y + self.m32 * z + self.m42 * w;
        let nz = self.m13 * x + self.m23 * y + self.m33 * z + self.m43 * w;
        let nw = self.m14 * x + self.m24 * y + self.m34 * z + self.m44 * w;

        DomPoint {
            x: nx,
            y: ny,
            z: nz,
            w: nw,
        }
    }
}

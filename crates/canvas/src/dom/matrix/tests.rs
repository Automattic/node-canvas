use crate::{assert_approx_eq, dom::point::DomPoint};
use super::DomMatrix;

#[test]
pub fn test_rotate_x_works() {
    let mut mat = DomMatrix::new(None);

    mat.rotate_self(70.0, None, None);

    assert_approx_eq!(mat.m11, 0.34202);
    assert_approx_eq!(mat.m12, 0.93969);
    assert_approx_eq!(mat.m13, 0.0);
    assert_approx_eq!(mat.m14, 0.0);

    assert_approx_eq!(mat.m21, -0.93969);
    assert_approx_eq!(mat.m22, 0.34202);
    assert_approx_eq!(mat.m23, 0.0);
    assert_approx_eq!(mat.m24, 0.0);

    assert_approx_eq!(mat.m31, 0.0);
    assert_approx_eq!(mat.m32, 0.0);
    assert_approx_eq!(mat.m33, 1.0);
    assert_approx_eq!(mat.m34, 0.0);

    assert_approx_eq!(mat.m41, 0.0);
    assert_approx_eq!(mat.m42, 0.0);
    assert_approx_eq!(mat.m43, 0.0);
    assert_approx_eq!(mat.m44, 1.0);
}

#[test]
pub fn test_transform_point() {
    let mut mat = DomMatrix::new(None);

    let ret = mat.transform_point(DomPoint {
        x: 1.0,
        y: 2.0,
        z: 3.0,
        ..Default::default()
    });

    assert_eq!(ret.x, 1.0);
    assert_eq!(ret.y, 2.0);
    assert_eq!(ret.z, 3.0);
    assert_eq!(ret.w, 1.0);

    mat.rotate_self(70.0, None, None);

    let ret = mat.transform_point(DomPoint {
        x: 2.0,
        y: 3.0,
        z: 4.0,
        ..Default::default()
    });

    assert_approx_eq!(ret.x, -2.13503);
    assert_approx_eq!(ret.y, 2.905445);
    assert_eq!(ret.z, 4.0);
    assert_eq!(ret.w, 1.0);
}

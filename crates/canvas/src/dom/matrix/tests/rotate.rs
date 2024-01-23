use crate::{assert_approx_eq, dom::matrix::DomMatrix};

#[test]
pub fn test_rotate_x_works() {
    let mut mat = DomMatrix::new(None);

    mat.rotate_self(70.0, None, None);

    assert_approx_eq!(mat.m11, 0.3420201);
    assert_approx_eq!(mat.m12, 0.9396926);
    assert_approx_eq!(mat.m13, 0.0);
    assert_approx_eq!(mat.m14, 0.0);

    assert_approx_eq!(mat.m21, -0.939692);
    assert_approx_eq!(mat.m22, 0.3420201);
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
pub fn test_rotate_xy_works() {
    let mut mat = DomMatrix::new(None);

    mat.rotate_self(70.0, Some(30.0), None);

    assert_approx_eq!(mat.m11, 0.8660254);
    assert_approx_eq!(mat.m12, 0.0);
    assert_approx_eq!(mat.m13, -0.5);
    assert_approx_eq!(mat.m14, 0.0);

    assert_approx_eq!(mat.m21, 0.4698463);
    assert_approx_eq!(mat.m22, 0.3420201);
    assert_approx_eq!(mat.m23, 0.8137976);
    assert_approx_eq!(mat.m24, 0.0);

    assert_approx_eq!(mat.m31, 0.1710100);
    assert_approx_eq!(mat.m32, -0.9396926);
    assert_approx_eq!(mat.m33, 0.2961981);
    assert_approx_eq!(mat.m34, 0.0);

    assert_approx_eq!(mat.m41, 0.0);
    assert_approx_eq!(mat.m42, 0.0);
    assert_approx_eq!(mat.m43, 0.0);
    assert_approx_eq!(mat.m44, 1.0);
}

#[test]
pub fn test_rotate_xyz_works() {
    let mut mat = DomMatrix::new(None);

    mat.rotate_self(70.0, Some(30.0), Some(50.0));

    assert_approx_eq!(mat.m11, 0.5566703);
    assert_approx_eq!(mat.m12, 0.6634139);
    assert_approx_eq!(mat.m13, -0.5);
    assert_approx_eq!(mat.m14, 0.0);

    assert_approx_eq!(mat.m21, 0.0400087);
    assert_approx_eq!(mat.m22, 0.5797694);
    assert_approx_eq!(mat.m23, 0.8137976);
    assert_approx_eq!(mat.m24, 0.0);

    assert_approx_eq!(mat.m31, 0.8297694);
    assert_approx_eq!(mat.m32, -0.4730214);
    assert_approx_eq!(mat.m33, 0.2961981);
    assert_approx_eq!(mat.m34, 0.0);

    assert_approx_eq!(mat.m41, 0.0);
    assert_approx_eq!(mat.m42, 0.0);
    assert_approx_eq!(mat.m43, 0.0);
    assert_approx_eq!(mat.m44, 1.0);
}

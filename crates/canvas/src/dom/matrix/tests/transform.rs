use crate::{
    assert_approx_eq,
    dom::{matrix::DomMatrix, point::DomPoint},
};

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

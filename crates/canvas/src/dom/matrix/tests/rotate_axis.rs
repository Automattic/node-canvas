use crate::{
    assert_approx_eq,
    dom::matrix::{tests::A_VALS, DomMatrix},
};

#[test]
pub fn rotate_axis_works() {
    let data = DomMatrix::new(Some(A_VALS.to_vec())).rotate_axis_angle(2.0, 4.0, 1.0, 35.0);

    assert_approx_eq!(data.m11, 1.9640922);
    assert_approx_eq!(data.m12, 2.4329989);
    assert_approx_eq!(data.m13, 2.0179538);
    assert_approx_eq!(data.m14, 2.6719387);

    assert_approx_eq!(data.m21, 0.6292488);
    assert_approx_eq!(data.m22, 4.0133545);
    assert_approx_eq!(data.m23, 5.6853755);
    assert_approx_eq!(data.m24, 3.0697681);

    assert_approx_eq!(data.m31, 4.5548203);
    assert_approx_eq!(data.m32, 6.0805840);
    assert_approx_eq!(data.m33, -0.7774101);
    assert_approx_eq!(data.m34, 11.3770500);

    assert_approx_eq!(data.m41, 2.0);
    assert_approx_eq!(data.m42, 4.0);
    assert_approx_eq!(data.m43, 6.0);
    assert_approx_eq!(data.m44, 1.0);
}

use crate::{assert_approx_eq, dom::matrix::DomMatrix};

#[test]
pub fn flip_x_works() {
    let mut mat = DomMatrix::new(None);

    mat.rotate_self(70.0, None, None);
    mat.flip_x_self();

    assert_approx_eq!(mat.get_a(), -0.34202);
    assert_approx_eq!(mat.get_b(), -0.93969);
    assert_approx_eq!(mat.get_c(), -0.93969);
    assert_approx_eq!(mat.get_d(), 0.34202);
    assert_eq!(mat.get_e(), 0.0);
    assert_eq!(mat.get_f(), 0.0);
}

#[test]
pub fn flip_y_works() {
    let mut mat = DomMatrix::new(None);

    mat.rotate_self(70.0, None, None);
    mat.flip_y_self();

    assert_approx_eq!(mat.get_a(), 0.34202);
    assert_approx_eq!(mat.get_b(), 0.93969);
    assert_approx_eq!(mat.get_c(), 0.93969);
    assert_approx_eq!(mat.get_d(), -0.34202);
    assert_eq!(mat.get_e(), 0.0);
    assert_eq!(mat.get_f(), 0.0);
}

use crate::{assert_approx_eq, dom::matrix::DomMatrix};

use super::A_VALS;

#[test]
pub fn rotate_vec_works_no_args() {
    assert_eq!(
        DomMatrix::new(Some(A_VALS.to_vec()))
            .rotate_from_vector(None, None)
            .values(),
        A_VALS
    );
}

#[test]
pub fn rotate_vec_works_one_arg() {
    assert_eq!(
        DomMatrix::new(Some(A_VALS.to_vec()))
            .rotate_from_vector(Some(5.0), None)
            .values(),
        A_VALS
    );
}

#[test]
pub fn rotate_vec_works_zeros() {
    assert_eq!(
        DomMatrix::new(Some(A_VALS.to_vec()))
            .rotate_from_vector(Some(0.0), Some(0.0))
            .values(),
        A_VALS
    );
}

#[test]
pub fn rotate_vec_works() {
    let mat = DomMatrix::new(Some(A_VALS.to_vec())).rotate_from_vector(Some(4.0), Some(2.0));
    
    assert_approx_eq!(mat.m11, 3.5777087);
    assert_approx_eq!(mat.m12, 5.8137767);
    assert_approx_eq!(mat.m13, 3.5777087);
    assert_approx_eq!(mat.m14, 7.6026311);

    assert_approx_eq!(mat.m21, -1.7888543);
    assert_approx_eq!(mat.m22, 0.4472135);
    assert_approx_eq!(mat.m23, 4.9193495);
    assert_approx_eq!(mat.m24, -2.6832815);

    assert_approx_eq!(mat.m31, 3.0);
    assert_approx_eq!(mat.m32, 5.0);
    assert_approx_eq!(mat.m33, 0.0);
    assert_approx_eq!(mat.m34, 9.0);

    assert_approx_eq!(mat.m41, 2.0);
    assert_approx_eq!(mat.m42, 4.0);
    assert_approx_eq!(mat.m43, 6.0);
    assert_approx_eq!(mat.m44, 1.0);
}

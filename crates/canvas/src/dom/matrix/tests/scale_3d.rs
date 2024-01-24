use crate::dom::matrix::DomMatrix;

use super::{check_matrix_output, A_VALS};

#[test]
pub fn scale_3d_works() {
    check_matrix_output(
        DomMatrix::new(Some(A_VALS.to_vec()))
            .scale_3d(None, None, None, None)
            .values(),
        A_VALS,
    );
}

#[test]
pub fn scale_3d_works_scale() {
    check_matrix_output(
        DomMatrix::new(Some(A_VALS.to_vec()))
            .scale_3d(Some(2.0), None, None, None)
            .values(),
        [
            8.0, 10.0, 2.0, 16.0, 0.0, 6.0, 12.0, 2.0, 6.0, 10.0, 0.0, 18.0, 2.0, 4.0, 6.0, 1.0,
        ],
    );
}

#[test]
pub fn scale_3d_works_scale_origin_x() {
    check_matrix_output(
        DomMatrix::new(Some(A_VALS.to_vec()))
            .scale_3d(Some(2.0), Some(3.0), None, None)
            .values(),
        [
            8.0, 10.0, 2.0, 16.0, 0.0, 6.0, 12.0, 2.0, 6.0, 10.0, 0.0, 18.0, -10.0, -11.0, 3.0,
            -23.0,
        ],
    );
}

#[test]
pub fn scale_3d_works_scale_origin_xy() {
    check_matrix_output(
        DomMatrix::new(Some(A_VALS.to_vec()))
            .scale_3d(Some(2.0), Some(3.0), Some(4.0), None)
            .values(),
        [
            8.0, 10.0, 2.0, 16.0, 0.0, 6.0, 12.0, 2.0, 6.0, 10.0, 0.0, 18.0, -10.0, -23.0, -21.0,
            -27.0,
        ],
    );
}

#[test]
pub fn scale_3d_works_scale_origin_xyz() {
    check_matrix_output(
        DomMatrix::new(Some(A_VALS.to_vec()))
            .scale_3d(Some(2.0), Some(3.0), Some(4.0), Some(5.0))
            .values(),
        [
            8.0, 10.0, 2.0, 16.0, 0.0, 6.0, 12.0, 2.0, 6.0, 10.0, 0.0, 18.0, -25.0, -48.0, -21.0,
            -72.0,
        ],
    );
}

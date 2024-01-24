use crate::dom::matrix::DomMatrix;

use super::check_matrix_output;

#[test]
pub fn scale_works_x() {
    check_matrix_output(
        DomMatrix::new(None)
            .scale(Some(2.0), None, None, None, None, None)
            .values(),
        [
            2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
        ],
    );
}

#[test]
pub fn scale_works_xy() {
    check_matrix_output(
        DomMatrix::new(None)
            .scale(Some(2.0), Some(3.0), None, None, None, None)
            .values(),
        [
            2.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
        ],
    );
}

#[test]
pub fn scale_works_xyz() {
    check_matrix_output(
        DomMatrix::new(None)
            .scale(Some(2.0), Some(3.0), Some(4.0), None, None, None)
            .values(),
        [
            2.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0, 0.0, 0.0, 0.0, 4.0, 0.0, 0.0, 0.0, 0.0, 1.0,
        ],
    );
}

#[test]
pub fn scale_works_xyz_origin_x() {
    check_matrix_output(
        DomMatrix::new(None)
            .scale(Some(2.0), Some(3.0), Some(4.0), Some(5.0), None, None)
            .values(),
        [
            2.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0, 0.0, 0.0, 0.0, 4.0, 0.0, -5.0, 0.0, 0.0, 1.0,
        ],
    );
}

#[test]
pub fn scale_works_xyz_origin_xy() {
    check_matrix_output(
        DomMatrix::new(None)
            .scale(Some(2.0), Some(3.0), Some(4.0), Some(5.0), Some(6.0), None)
            .values(),
        [
            2.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0, 0.0, 0.0, 0.0, 4.0, 0.0, -5.0, -12.0, 0.0, 1.0,
        ],
    );
}

#[test]
pub fn scale_works_xyz_origin_xyz() {
    check_matrix_output(
        DomMatrix::new(None)
            .scale(
                Some(2.0),
                Some(1.0),
                Some(1.0),
                Some(0.0),
                Some(0.0),
                Some(0.0),
            )
            .values(),
        [
            2.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
        ],
    );

    check_matrix_output(
        DomMatrix::new(None)
            .scale(
                Some(2.0),
                Some(3.0),
                Some(2.0),
                Some(0.0),
                Some(0.0),
                Some(0.0),
            )
            .values(),
        [
            2.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 1.0,
        ],
    );

    check_matrix_output(
        DomMatrix::new(None)
            .scale(
                Some(5.0),
                Some(-1.0),
                Some(2.0),
                Some(1.0),
                Some(3.0),
                Some(2.0),
            )
            .values(),
        [
            5.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, -4.0, 6.0, -2.0, 1.0,
        ],
    );
}

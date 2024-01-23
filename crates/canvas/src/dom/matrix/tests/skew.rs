use crate::dom::matrix::DomMatrix;

use super::{check_matrix_output, A_VALS};

#[test]
pub fn skew_x_works() {
    check_matrix_output(
        DomMatrix::new(Some(A_VALS.to_vec())).skew_x(30.0).values(),
        [
            4.0, 5.0, 1.0, 8.0, 2.3094010, 5.8867513, 6.5773502, 5.6188021, 3.0, 5.0, 0.0, 9.0,
            2.0, 4.0, 6.0, 1.0,
        ],
    );
}

#[test]
pub fn skew_y_works() {
    check_matrix_output(
        DomMatrix::new(Some(A_VALS.to_vec())).skew_y(30.0).values(),
        [
            4.0, 6.7320508, 4.4641016, 8.5773502, 0.0, 3.0, 6.0, 1.0, 3.0, 5.0, 0.0, 9.0, 2.0, 4.0,
            6.0, 1.0,
        ],
    );
}

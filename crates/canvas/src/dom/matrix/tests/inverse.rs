use crate::dom::matrix::{tests::X_VALS, DomMatrix};

use super::{check_matrix_output, A_VALS};

#[test]
pub fn invert_self_works_for_invertible() {
    let mut mat = DomMatrix::new(Some(A_VALS.to_vec()));

    mat.invert_self();

    check_matrix_output(
        mat.values(),
        [
            0.9152542372881356,
            -0.01694915254237288,
            -0.7966101694915254,
            -0.13559322033898305,
            -1.8305084745762712,
            -0.9661016949152542,
            1.5932203389830508,
            1.271186440677966,
            0.7966101694915254,
            0.559322033898305,
            -0.711864406779661,
            -0.5254237288135594,
            0.711864406779661,
            0.5423728813559322,
            -0.5084745762711864,
            -0.6610169491525424,
        ],
    );
}

#[test]
pub fn invert_self_works_for_non_invertible() {
    let mut mat = DomMatrix::new(Some(X_VALS.to_vec()));

    mat.invert_self();

    assert_eq!(mat.values().iter().all(|v| v.is_nan()), true);
    assert_eq!(mat.is_2d(), false);
}

#[test]
pub fn inverse_preserves_original() {
    let mat = DomMatrix::new(Some(A_VALS.to_vec()));
    let mat2 = mat.inverse();

    assert_eq!(mat.values(), A_VALS);

    check_matrix_output(
        mat2.values(),
        [
            0.9152542372881356,
            -0.01694915254237288,
            -0.7966101694915254,
            -0.13559322033898305,
            -1.8305084745762712,
            -0.9661016949152542,
            1.5932203389830508,
            1.271186440677966,
            0.7966101694915254,
            0.559322033898305,
            -0.711864406779661,
            -0.5254237288135594,
            0.711864406779661,
            0.5423728813559322,
            -0.5084745762711864,
            -0.6610169491525424,
        ],
    );
}

#[test]
pub fn inverse_preserves_original_non_invertible() {
    let mat = DomMatrix::new(Some(X_VALS.to_vec()));
    let mat2 = mat.inverse();

    assert_eq!(mat.values(), X_VALS);
    assert_eq!(mat2.values().iter().all(|v| v.is_nan()), true);
    assert_eq!(mat2.is_2d(), false);
}

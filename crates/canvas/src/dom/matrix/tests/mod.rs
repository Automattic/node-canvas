use crate::assert_approx_eq;

pub mod flip;
pub mod inverse;
pub mod rotate;
pub mod rotate_axis;
pub mod rotate_vec;
pub mod scale;
pub mod skew;
pub mod transform;
pub mod translate;

pub const A_VALS: [f64; 16] = [
    4.0, 5.0, 1.0, 8.0, 0.0, 3.0, 6.0, 1.0, 3.0, 5.0, 0.0, 9.0, 2.0, 4.0, 6.0, 1.0,
];
pub const X_VALS: [f64; 16] = [
    1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0,
];

pub fn check_matrix_output(real: [f64; 16], expected: [f64; 16]) {
    assert_approx_eq!(real[0], expected[0]);
    assert_approx_eq!(real[1], expected[1]);
    assert_approx_eq!(real[2], expected[2]);
    assert_approx_eq!(real[3], expected[3]);
    assert_approx_eq!(real[4], expected[4]);
    assert_approx_eq!(real[5], expected[5]);
    assert_approx_eq!(real[6], expected[6]);
    assert_approx_eq!(real[7], expected[7]);
    assert_approx_eq!(real[8], expected[8]);
    assert_approx_eq!(real[9], expected[9]);
    assert_approx_eq!(real[10], expected[10]);
    assert_approx_eq!(real[11], expected[11]);
    assert_approx_eq!(real[12], expected[12]);
    assert_approx_eq!(real[13], expected[13]);
    assert_approx_eq!(real[14], expected[14]);
    assert_approx_eq!(real[15], expected[15]);
}

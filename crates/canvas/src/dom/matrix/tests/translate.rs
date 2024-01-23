use crate::dom::matrix::{tests::A_VALS, DomMatrix};

#[test]
pub fn translate_works_x() {
    let mut mat = DomMatrix::new(None);

    mat.translate_self(1.0, None, None);

    assert_eq!(
        mat.values(),
        [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0]
    );
}

#[test]
pub fn translate_works_xy() {
    let mut mat = DomMatrix::new(Some(A_VALS.to_vec()));

    mat.translate_self(2.0, Some(5.0), None);

    assert_eq!(
        mat.values(),
        [4.0, 5.0, 1.0, 8.0, 0.0, 3.0, 6.0, 1.0, 3.0, 5.0, 0.0, 9.0, 10.0, 29.0, 38.0, 22.0]
    );
}

#[test]
pub fn translate_works_xyz() {
    let mut mat = DomMatrix::new(None);

    mat.translate_self(1.0, Some(2.0), Some(3.0));

    assert_eq!(
        mat.values(),
        [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 2.0, 3.0, 1.0]
    );
}

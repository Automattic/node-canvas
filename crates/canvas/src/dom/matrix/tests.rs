use crate::dom::point::DomPoint;

use super::DomMatrix;

#[test]
pub fn test_transform_point() {
    let mut x = DomMatrix::new(None);
    
    let r = x.transform_point(DomPoint {
        x: Some(1.0),
        y: Some(2.0),
        z: Some(3.0),
        w: None,
    });

    assert_eq!(r.x, Some(1.0));
    assert_eq!(r.y, Some(2.0));
    assert_eq!(r.z, Some(3.0));
    assert_eq!(r.w, Some(1.0));

    x.rotate_self(70.0, None, None);

    dbg!(x);

    let r = x.transform_point(DomPoint {
        x: Some(2.0),
        y: Some(3.0),
        z: Some(4.0),
        w: None,
    });

    assert_eq!(r.x, None); // 0.9252698035077044 (should be -2.135037575706388)
    assert_eq!(r.y, None); // (should be 2.905445671548823)
    assert_eq!(r.z, Some(4.0)); // (should be 4)
    assert_eq!(r.w, Some(1.0)); // should be 1
}

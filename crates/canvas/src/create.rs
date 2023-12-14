use crate::{image::kind::ImageKind, canvas::canvas::Canvas};

#[napi]
pub fn create_canvas(width: i32, height: i32, kind: Option<ImageKind>) -> Canvas {
    Canvas::new(width, height, kind)
}

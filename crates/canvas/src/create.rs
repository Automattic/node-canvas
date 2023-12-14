use crate::{canvas::canvas::Canvas, image::kind::ImageKind};

#[napi]
pub fn create_canvas(width: i32, height: i32, kind: Option<ImageKind>) -> Canvas {
    Canvas::new(width, height, kind)
}

use napi::{bindgen_prelude::Uint8ClampedArray, Either};

use crate::{
    canvas::canvas::Canvas,
    image::{data::ImageData, kind::ImageKind},
};

#[napi]
pub fn create_canvas(width: i32, height: i32, kind: Option<ImageKind>) -> Canvas {
    Canvas::new(width, height, kind)
}

#[napi]
pub fn create_image_data(
    width: i32,
    height: Option<i32>,
    data: Option<Either<Vec<u16>, Uint8ClampedArray>>,
) -> ImageData {
    if let Some(data) = data {
        let data = match data {
            Either::A(val) => unsafe { val.align_to().1.to_vec() },
            Either::B(val) => val.to_vec(),
        };

        ImageData::with_data(Uint8ClampedArray::new(data), width, height)
    } else {
        ImageData::new(width, height.unwrap_or(0))
    }
}

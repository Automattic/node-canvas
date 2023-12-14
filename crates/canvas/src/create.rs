use napi::bindgen_prelude::{Uint8ClampedArray, Uint16Array, Either3};

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
    data: Option<Either3<Vec<u16>, Uint8ClampedArray, Uint16Array>>,
) -> ImageData {
    if let Some(data) = data {
        let data = match data {
            Either3::A(val) => unsafe { val.align_to().1.to_vec() },
            Either3::B(val) => val.to_vec(),
            Either3::C(val) => unsafe { val.to_vec().align_to().1.to_vec() },
        };

        ImageData::with_data(Uint8ClampedArray::new(data), width, height)
    } else {
        ImageData::new(width, height.unwrap_or(0))
    }
}

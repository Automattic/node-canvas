use either::Either;
use napi::bindgen_prelude::Buffer;

use super::mode::ImageMode;

#[napi]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Image {
    src: Either<String, Vec<u8>>,

    pub data_mode: ImageMode,
    pub width: i32,
    pub height: i32,
    pub complete: bool,
    pub natural_width: i32,
    pub natural_height: i32,
}

#[napi]
impl Image {
    #[napi(getter)]
    pub fn get_src(&self) -> napi::Either<String, Buffer> {
        match self.clone().src {
            Either::Left(val) => napi::Either::A(val),
            Either::Right(val) => napi::Either::B(Buffer::from(val)),
        }
    }

    #[napi(setter)]
    pub fn set_src(&mut self, val: napi::Either<String, Buffer>) {
        match val {
            napi::Either::A(val) => self.src = Either::Left(val),
            napi::Either::B(val) => self.src = Either::Right(val.to_vec()),
        }
    }
}

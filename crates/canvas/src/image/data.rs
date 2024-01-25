use napi::bindgen_prelude::Uint8ClampedArray;

#[conditional_napi]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub struct ImageData {
    data: Vec<u8>,

    pub width: i32,
    pub height: i32,
}

#[conditional_napi]
impl ImageData {
    #[cfg_attr(feature = "napi", napi(constructor))]
    pub fn new(width: i32, height: i32) -> Self {
        Self {
            width,
            height,
            data: Vec::with_capacity((width * height) as usize),
        }
    }

    #[cfg_attr(feature = "napi", napi(factory))]
    pub fn with_data(data: Uint8ClampedArray, width: i32, height: Option<i32>) -> Self {
        let height = height.unwrap_or_else(|| {
            // Calculate height assuming 4 BPP
            let size = data.len() as i32 / 4;
            size / width
        });

        Self {
            data: data.to_vec(),
            width,
            height,
        }
    }

    #[cfg_attr(feature = "napi", napi(getter))]
    pub fn get_data(&self) -> Uint8ClampedArray {
        Uint8ClampedArray::new(self.data.clone())
    }

    #[cfg_attr(feature = "napi", napi(setter))]
    pub fn set_data(&mut self, data: Uint8ClampedArray) {
        self.data = data.to_vec();
    }
}

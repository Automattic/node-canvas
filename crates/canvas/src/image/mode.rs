use napi::{
    bindgen_prelude::FromNapiValue,
    sys::{napi_env, napi_get_value_uint32, napi_value},
    Result,
};

bitflags! {
    #[napi]
    #[repr(transparent)]
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
    pub struct ImageMode: u32 {
        const Image = 0b00000001;
        const Mime  = 0b00000010;
    }
}

impl FromNapiValue for ImageMode {
    unsafe fn from_napi_value(env: napi_env, napi_val: napi_value) -> Result<Self> {
        let mut ret = 0;

        napi_get_value_uint32(env, napi_val, &mut ret);

        Ok(ImageMode::from_bits_retain(ret))
    }
}

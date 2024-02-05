use napi::{
    bindgen_prelude::FromNapiValue,
    sys::{napi_env, napi_get_value_uint32, napi_value},
    Result,
};

bitflags! {
    #[napi]
    #[repr(transparent)]
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
    pub struct PngFilters: u32 {
        const NoFilters = 0b00000001;
        const All       = 0b00000010;
        const None      = 0b00000100;
        const Sub       = 0b00001000;
        const Up        = 0b00010000;
        const Avg       = 0b00100000;
        const Paeth     = 0b01000000;
    }
}

impl FromNapiValue for PngFilters {
    unsafe fn from_napi_value(env: napi_env, napi_val: napi_value) -> Result<Self> {
        let mut ret = 0;

        napi_get_value_uint32(env, napi_val, &mut ret);

        Ok(Self::from_bits_retain(ret))
    }
}

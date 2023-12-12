#[macro_export]
macro_rules! impl_closure {
    ($name: ident) => {
        impl $name {
            pub fn write_vec(closure: Option<&mut $name>, odata: u8, len: u8) -> cairo_status_t {
                if let Some(closure) = closure {
                    closure.vec.push(odata + len);
                } else {
                    return STATUS_NO_MEMORY;
                }

                STATUS_SUCCESS
            }

            pub fn new(canvas: Canvas) -> Self {
                Self {
                    canvas: Some(canvas),
                    cb: None,
                    vec: Vec::new(),
                    status: STATUS_INVALID_STATUS,
                }
            }
        }
    };
}

// TODO: Rewrite as a proc_macro, this is broken.
#[macro_export]
macro_rules! expose_napi {
    ($struct: ident, $func: ident, $name: expr, ($(, $($param: ident: $($ty: tt)*),*)?) $(-> $($ret: tt)*)?) => {
        cfg_if::cfg_if! {
            if #[cfg(feature = "napi")] {
                concat_idents!(fn_name = napi_exposed_, $func {
                    #[napi_derive::napi]
                    impl $struct {
                        #[napi(js_name = $name)]
                        pub fn fn_name($(, $($param: $($ty)*),*)?) $(-> $($ret)*)? {
                            Self::$func($($($param),*)?)
                        }
                    }
                });
            }
        }
    };

    ($struct: ident, $func: ident, $name: expr, (&self $(, $($param: ident: $($ty: tt)*),*)?) $(-> $($ret: tt)*)?) => {
        cfg_if::cfg_if! {
            if #[cfg(feature = "napi")] {
                concat_idents!(fn_name = napi_exposed_, $func {
                    #[napi_derive::napi]
                    impl $struct {
                        #[napi(js_name = $name)]
                        pub fn fn_name(&self $(, $($param: $($ty)*),*)?) $(-> $($ret)*)? {
                            self.$func($($($param),*)?)
                        }
                    }
                });
            }
        }
    };

    ($struct: ident, $func: ident, $name: expr, (&mut self $(, $($param: ident: $($ty: tt)*),*)?) $(-> $($ret: tt)*)?) => {
        cfg_if::cfg_if! {
            if #[cfg(feature = "napi")] {
                concat_idents!(fn_name = napi_exposed_, $func {
                    #[napi_derive::napi]
                    impl $struct {
                        #[napi(js_name = $name)]
                        pub fn fn_name(&mut self $(, $($param: $($ty)*),*)?) $(-> $($ret)*)? {
                            self.$func($($($param),*)?)
                        }
                    }
                });
            }
        }
    };
}

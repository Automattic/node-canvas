#[macro_export]
macro_rules! alias_property {
    ($struct: ident, $type: ident, $alias: ident, $real: ident) => {
        concat_idents!(fn_name = get_, $alias, _napi_alias {
            #[napi]
            #[allow(non_snake_case)]
            impl $struct {
                #[napi(getter, js_name = $alias)]
                pub fn fn_name(&self) -> $type {
                    self.$real
                }
            }
        });

        concat_idents!(fn_name = set_, $alias, _napi_alias {
            #[napi]
            #[allow(non_snake_case)]
            impl $struct {
                #[napi(setter, js_name = $alias)]
                pub fn fn_name(&mut self, new_val: $type) {
                    self.$real = new_val;
                }
            }
        });
    }
}

#[macro_export]
macro_rules! alias_property_borrow {
    ($struct: ident, $type: ident, $alias: ident, $real: ident) => {
        concat_idents!(fn_name = get_, $alias, _napi_alias {
            #[napi]
            #[allow(non_snake_case)]
            impl $struct {
                #[napi(getter, js_name = $alias)]
                pub fn fn_name(&self) -> &$type {
                    &self.$real
                }
            }
        });

        concat_idents!(fn_name = set_, $alias, _napi_alias {
            #[napi]
            #[allow(non_snake_case)]
            impl $struct {
                #[napi(setter, js_name = $alias)]
                pub fn fn_name(&mut self, new_val: &$type) {
                    self.$real = new_val.clone();
                }
            }
        });
    }
}

#[macro_export]
macro_rules! napi_class {
    ($name: ident) => {
        #[napi]
        impl $name {
            #[napi]
            pub fn to_string(&self) -> String {
                format!("[object {}]", stringify!($name))
            }
        }
    }
}

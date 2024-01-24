#[macro_export]
macro_rules! alias_property {
    ($struct: ident, $type: ident, $alias: ident, $($real: expr)+) => {
        concat_idents!(fn_name = get_, $alias {
            #[napi]
            #[allow(non_snake_case)]
            impl $struct {
                #[napi(getter, js_name = $alias)]
                pub fn fn_name(&self) -> $type {
                    self.$($real).+
                }
            }
        });

        concat_idents!(fn_name = set_, $alias {
            #[napi]
            #[allow(non_snake_case)]
            impl $struct {
                #[napi(setter, js_name = $alias)]
                pub fn fn_name(&mut self, new_val: $type) {
                    self.$($real).+ = new_val;
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
macro_rules! fix_zero {
    ($val: expr) => {
        if $val == 0.0 || $val == -0.0 {
            0.0
        } else {
            $val
        }
    };
}

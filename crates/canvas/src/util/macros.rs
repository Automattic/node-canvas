#[macro_export]
macro_rules! alias_property {
    ($struct: ident, $type: ident, $alias: ident, $($real: expr)+) => {
        concat_idents!(fn_name = get_, $alias {
            #[allow(non_snake_case)]
            impl $struct {
                pub fn fn_name(&self) -> $type {
                    self.$($real).+
                }
            }
        });

        paste::paste! {
            $crate::expose_napi!($struct, [<get_ $alias>], $alias, (&self) -> $type);
        }

        concat_idents!(fn_name = set_, $alias {
            #[allow(non_snake_case)]
            impl $struct {
                pub fn fn_name(&mut self, new_val: $type) {
                    self.$($real).+ = new_val;
                }
            }
        });

        paste::paste! {
            $crate::expose_napi!($struct, [<set_ $alias>], $alias, (&mut self, new_val: $type));
        }
    }
}

#[macro_export]
macro_rules! alias_property_borrow {
    ($struct: ident, $type: ident, $alias: ident, $real: ident) => {
        concat_idents!(fn_name = get_, $alias, _napi_alias {
            #[allow(non_snake_case)]
            impl $struct {
                pub fn fn_name(&self) -> &$type {
                    &self.$real
                }
            }
        });

        paste::paste! {
            $crate::expose_napi!($struct, [<get_ $alias _napi_alias>], $alias, (&self) -> *$type);
        }

        concat_idents!(fn_name = set_, $alias, _napi_alias {
            #[allow(non_snake_case)]
            impl $struct {
                pub fn fn_name(&mut self, new_val: &$type) {
                    self.$real = new_val.clone();
                }
            }
        });

        paste::paste! {
            $crate::expose_napi!($struct, [<set_ $alias _napi_alias>], $alias, (&mut self, new_val: &$type));
        }
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

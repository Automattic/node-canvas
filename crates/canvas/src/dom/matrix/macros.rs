#[macro_export]
macro_rules! alias_property {
    ($struct: ident, $type: ident, $alias: ident, $real: ident) => {
        concat_idents!(fn_name = get_, $alias, _napi_alias {
            #[napi]
            impl $struct {
                #[napi(getter)]
                pub fn fn_name(&self) -> $type {
                    self.$real
                }
            }
        });

        concat_idents!(fn_name = set_, $alias, _napi_alias {
            #[napi]
            impl $struct {
                #[napi(setter)]
                pub fn fn_name(&mut self, new_val: $type) {
                    self.$real = new_val;
                }
            }
        });
    }
}

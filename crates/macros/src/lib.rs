use proc_macro::TokenStream;
use quote::quote;

#[proc_macro_attribute]
pub fn conditional_napi(attr: TokenStream, item: TokenStream) -> TokenStream {
    #[cfg(feature = "napi")]
    {
        let data = proc_macro2::TokenStream::from(napi_derive::napi(attr, item));

        (quote! {
            #data
        })
        .into()
    }

    #[cfg(not(feature = "napi"))]
    {
        let _ = attr;
        let item = proc_macro2::TokenStream::from(item);

        if item.to_string().contains(" enum ") {
            (quote! {
                #[derive(Clone, Copy)]
                #item
            })
            .into()
        } else {
            (quote! {
                #item
            })
            .into()
        }
    }
}

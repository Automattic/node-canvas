#[cfg(feature = "compat-mode")]
mod compat_macro;
mod expand;
mod parser;

#[macro_use]
extern crate syn;
#[macro_use]
extern crate napi_derive_backend;
#[macro_use]
extern crate quote;
extern crate proc_macro;

use std::env;

use proc_macro::TokenStream;
#[cfg(feature = "compat-mode")]
use syn::{fold::Fold, parse_macro_input, ItemFn};

/// ```ignore
/// #[napi]
/// fn test(ctx: CallContext, name: String) {
///   "hello" + name
/// }
/// ```
pub fn napi(attr: TokenStream, input: TokenStream) -> TokenStream {
    match expand::expand(attr.into(), input.into()) {
        Ok(tokens) => {
            if env::var("DEBUG_GENERATED_CODE").is_ok() {
                println!("{}", tokens);
            }
            tokens.into()
        }
        Err(diagnostic) => {
            println!("`napi` macro expand failed.");

            (quote! { #diagnostic }).into()
        }
    }
}

#[cfg(feature = "compat-mode")]
pub fn contextless_function(_attr: TokenStream, input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as ItemFn);
    let mut js_fn = compat_macro::JsFunction::new();
    js_fn.fold_item_fn(input);
    let fn_name = js_fn.name.unwrap();
    let fn_block = js_fn.block;
    let signature = js_fn.signature.unwrap();
    let visibility = js_fn.visibility;
    let new_fn_name = signature.ident.clone();
    let execute_js_function =
        compat_macro::get_execute_js_code(new_fn_name, compat_macro::FunctionKind::Contextless);

    let expanded = quote! {
      #[inline(always)]
      #signature #(#fn_block)*

      #visibility extern "C" fn #fn_name(
        raw_env: napi::sys::napi_env,
        cb_info: napi::sys::napi_callback_info,
      ) -> napi::sys::napi_value {
        use std::ptr;
        use std::panic::{self, AssertUnwindSafe};
        use std::ffi::CString;
        use napi::{Env, NapiValue, NapiRaw, Error, Status};

        let ctx = unsafe { Env::from_raw(raw_env) };
        #execute_js_function
      }
    };
    // Hand the output tokens back to the compiler
    TokenStream::from(expanded)
}

#[cfg(feature = "compat-mode")]
pub fn js_function(attr: TokenStream, input: TokenStream) -> TokenStream {
    let arg_len = parse_macro_input!(attr as compat_macro::ArgLength);
    let arg_len_span = arg_len.length;
    let input = parse_macro_input!(input as ItemFn);
    let mut js_fn = compat_macro::JsFunction::new();
    js_fn.fold_item_fn(input);
    let fn_name = js_fn.name.unwrap();
    let fn_block = js_fn.block;
    let signature = js_fn.signature.unwrap();
    let visibility = js_fn.visibility;
    let new_fn_name = signature.ident.clone();
    let execute_js_function =
        compat_macro::get_execute_js_code(new_fn_name, compat_macro::FunctionKind::JsFunction);
    let expanded = quote! {
      #[inline(always)]
      #signature #(#fn_block)*

      #visibility extern "C" fn #fn_name(
        raw_env: napi::sys::napi_env,
        cb_info: napi::sys::napi_callback_info,
      ) -> napi::sys::napi_value {
        use std::ptr;
        use std::panic::{self, AssertUnwindSafe};
        use std::ffi::CString;
        use napi::{Env, Error, Status, NapiValue, NapiRaw, CallContext};
        let mut argc = #arg_len_span as usize;
        #[cfg(all(target_os = "windows", target_arch = "x86"))]
        let mut raw_args = vec![ptr::null_mut(); #arg_len_span];
        #[cfg(not(all(target_os = "windows", target_arch = "x86")))]
        let mut raw_args = [ptr::null_mut(); #arg_len_span];
        let mut raw_this = ptr::null_mut();

        unsafe {
          let status = napi::sys::napi_get_cb_info(
            raw_env,
            cb_info,
            &mut argc,
            raw_args.as_mut_ptr(),
            &mut raw_this,
            ptr::null_mut(),
          );
          debug_assert!(Status::from(status) == Status::Ok, "napi_get_cb_info failed");
        }

        let mut env = unsafe { Env::from_raw(raw_env) };
        #[cfg(all(target_os = "windows", target_arch = "x86"))]
        let ctx = CallContext::new(&mut env, cb_info, raw_this, raw_args.as_slice(), argc);
        #[cfg(not(all(target_os = "windows", target_arch = "x86")))]
        let ctx = CallContext::new(&mut env, cb_info, raw_this, &raw_args, argc);
        #execute_js_function
      }
    };
    // Hand the output tokens back to the compiler
    TokenStream::from(expanded)
}

#[cfg(feature = "compat-mode")]
pub fn module_exports(_attr: TokenStream, input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as ItemFn);
    let mut js_fn = compat_macro::JsFunction::new();
    js_fn.fold_item_fn(input);
    let fn_block = js_fn.block;
    let fn_name = js_fn.name.unwrap();
    let signature = js_fn.signature_raw.unwrap();
    let args_len = js_fn.args.len();
    let call_expr = if args_len == 1 {
        quote! { #fn_name(exports) }
    } else if args_len == 2 {
        quote! { #fn_name(exports, env) }
    } else {
        panic!("Arguments length of #[module_exports] function must be 1 or 2");
    };

    let register = quote! {
      #[cfg_attr(not(target_family = "wasm"), napi::bindgen_prelude::ctor)]
      fn __napi__explicit_module_register() {
        unsafe fn register(raw_env: napi::sys::napi_env, raw_exports: napi::sys::napi_value) -> napi::Result<()> {
          use napi::{Env, JsObject, NapiValue};

          let env = Env::from_raw(raw_env);
          let exports = JsObject::from_raw_unchecked(raw_env, raw_exports);

          #call_expr
        }

        napi::bindgen_prelude::register_module_exports(register)
      }
    };

    (quote! {
      #[inline]
      #signature #(#fn_block)*

      #register
    })
    .into()
}

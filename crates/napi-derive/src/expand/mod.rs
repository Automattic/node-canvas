cfg_if::cfg_if! {
    if #[cfg(feature = "noop")] {
        mod noop;
        pub use self::noop::*;
    } else {
        mod napi;
        pub use self::napi::*;
    }
}

#[macro_export]
macro_rules! impl_backend_base {
    ($name: ident) => {
        impl $name {
            pub fn new(width: i32, height: i32) -> Self {
                Self {
                    width,
                    height,
                    ..Self::default()
                }
            }
        }
    };
}

#[macro_export]
macro_rules! impl_backend_trait {
    () => {
        unsafe fn is_surface_valid(&mut self, env: &mut Env) -> bool {
            let mut is_valid = true;

            if let Some(surface) = self.get_surface() {
                let status = cairo::ffi::cairo_surface_status(surface.to_raw_none());

                if status != cairo::ffi::STATUS_SUCCESS {
                    self.set_error(
                        std::ffi::CStr::from_ptr(cairo::ffi::cairo_status_to_string(status))
                            .to_str()
                            .unwrap()
                            .to_string(),
                    );

                    is_valid = false;
                }
            } else {
                self.destroy_surface(env);
            }

            is_valid
        }

        unsafe fn set_width(&mut self, width: i32, env: &mut Env) {
            self.width = width;
            self.recreate_surface(env);
        }

        unsafe fn set_height(&mut self, height: i32, env: &mut Env) {
            self.height = height;
            self.recreate_surface(env);
        }

        fn set_error(&mut self, error: String) {
            self.error = Some(error);
        }

        fn get_surface(&self) -> Option<Surface> {
            self.surface.clone()
        }

        fn get_name(&self) -> String {
            self.name.clone()
        }

        fn get_width(&self) -> i32 {
            self.width
        }

        fn get_height(&self) -> i32 {
            self.height
        }

        fn get_error(&self) -> Option<String> {
            self.error.clone()
        }
    };
}

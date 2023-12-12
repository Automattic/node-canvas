use cairo::{ffi::cairo_surface_destroy, Format, Surface};
use napi::Env;

use crate::{canvas::canvas::Canvas, impl_backend_base, impl_backend_trait};

#[derive(Debug, Clone, Default)]
pub struct BaseBackend {
    name: String,
    error: Option<String>,

    pub(crate) width: i32,
    pub(crate) height: i32,
    pub(crate) surface: Option<Surface>,
    pub(crate) canvas: Canvas<Box<BaseBackend>>,
}

pub trait BackendTrait: std::fmt::Debug + Clone + Sized {
    unsafe fn create_surface(&mut self, env: &mut Env) -> Option<Surface>;
    unsafe fn recreate_surface(&mut self, env: &mut Env) -> Option<Surface>;
    unsafe fn destroy_surface(&mut self, env: &mut Env);
    unsafe fn is_surface_valid(&mut self, env: &mut Env) -> bool;

    unsafe fn set_canvas(&mut self, canvas: Canvas);
    unsafe fn set_width(&mut self, width: i32, env: &mut Env);
    unsafe fn set_height(&mut self, height: i32, env: &mut Env);

    fn set_format(&mut self, format: Format);
    fn set_error(&mut self, error: String);

    fn get_surface(&self) -> Option<Surface>;
    fn get_name(&self) -> String;
    fn get_width(&self) -> i32;
    fn get_height(&self) -> i32;
    fn get_format(&self) -> Format;
    fn get_error(&self) -> Option<String>;
}

impl_backend_base!(BaseBackend);

impl BackendTrait for BaseBackend {
    impl_backend_trait! {}

    fn get_format(&self) -> Format {
        Format::Invalid
    }

    fn set_format(&mut self, _: Format) {
        // Nothing.
    }

    unsafe fn create_surface(&mut self, _: &mut Env) -> Option<Surface> {
        panic!("Cannot execute create_surface on BaseBackend!");
    }

    unsafe fn destroy_surface(&mut self, _: &mut Env) {
        if let Some(surface) = &mut self.surface {
            cairo_surface_destroy(surface.to_raw_none());
            self.surface = None;
        }
    }

    unsafe fn recreate_surface(&mut self, env: &mut Env) -> Option<Surface> {
        self.destroy_surface(env);
        self.create_surface(env)
    }

    unsafe fn set_canvas(&mut self, canvas: Canvas) {
        self.canvas = canvas;
    }
}

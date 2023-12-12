use cairo::{
    ffi::{cairo_image_surface_create, cairo_surface_destroy},
    Format, Surface,
};
use napi::Env;

use crate::{canvas::canvas::Canvas, impl_backend_base, impl_backend_trait};

use super::backend::BackendTrait;

#[derive(Debug, Clone)]
pub struct ImageBackend {
    name: String,
    error: Option<String>,
    format: Format,

    pub(crate) width: i32,
    pub(crate) height: i32,
    pub(crate) surface: Option<Surface>,
    pub(crate) canvas: Canvas,
}

impl Default for ImageBackend {
    fn default() -> Self {
        Self {
            name: String::new(),
            error: None,
            format: Format::ARgb32,
            width: 0,
            height: 0,
            surface: None,
            canvas: Canvas::default(),
        }
    }
}

impl_backend_base!(ImageBackend);

impl ImageBackend {
    pub fn approx_bytes_per_pixel(&self) -> i32 {
        match self.format {
            Format::ARgb32 | Format::Rgb24 => 4,
            Format::Rgb30 => 3,
            Format::Rgb16_565 => 2,
            Format::A8 | Format::A1 => 1,
            _ => 0,
        }
    }
}

impl BackendTrait for ImageBackend {
    impl_backend_trait! {}

    fn get_format(&self) -> Format {
        self.format
    }

    fn set_format(&mut self, format: Format) {
        self.format = format;
    }

    unsafe fn create_surface(&mut self, env: &mut Env) -> Option<Surface> {
        assert!(self.surface.is_none());
        self.surface = Some(Surface::from_raw_none(cairo_image_surface_create(
            self.format.into(),
            self.width,
            self.height,
        )));
        assert!(self.surface.is_some());
        env.adjust_external_memory(
            (self.approx_bytes_per_pixel() * self.width * self.height) as i64,
        )
        .unwrap();

        self.surface.clone()
    }

    unsafe fn destroy_surface(&mut self, env: &mut Env) {
        if let Some(surface) = &mut self.surface {
            cairo_surface_destroy(surface.to_raw_none());
            self.surface = None;
            env.adjust_external_memory(
                (-self.approx_bytes_per_pixel() * self.width * self.height) as i64,
            )
            .unwrap();
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

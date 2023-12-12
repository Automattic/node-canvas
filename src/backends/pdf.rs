use std::ffi::c_void;

use cairo::{
    ffi::{cairo_pdf_surface_create_for_stream, cairo_pdf_surface_set_size, cairo_surface_destroy},
    Format, Surface,
};
use napi::Env;

use crate::{
    canvas::canvas::Canvas, closure::PdfSvgClosure, impl_backend_base, impl_backend_trait,
};

use super::backend::BackendTrait;

#[derive(Debug, Clone)]
pub struct PdfBackend {
    name: String,
    error: Option<String>,
    closure: Option<PdfSvgClosure>,

    pub(crate) width: i32,
    pub(crate) height: i32,
    pub(crate) surface: Option<Surface>,
    pub(crate) canvas: Canvas,
}

impl Default for PdfBackend {
    fn default() -> Self {
        Self {
            name: String::new(),
            error: None,
            closure: None,
            width: 0,
            height: 0,
            surface: None,
            canvas: Canvas::default(),
        }
    }
}

impl_backend_base!(PdfBackend);

impl PdfBackend {
    pub fn get_closure(&self) -> Option<PdfSvgClosure> {
        self.closure
    }
}

impl BackendTrait for PdfBackend {
    impl_backend_trait! {}

    fn get_format(&self) -> Format {
        Format::Invalid
    }

    fn set_format(&mut self, _: Format) {
        // Nothing.
    }

    unsafe fn create_surface(&mut self, env: &mut Env) -> Option<Surface> {
        if self.closure.is_none() {
            self.closure = Some(PdfSvgClosure::new(self.canvas));
        }

        let pdfs = cairo_pdf_surface_create_for_stream(
            Some(PdfSvgClosure::write_vec_c),
            &mut self.closure.unwrap() as *mut _ as *mut c_void,
            self.width as f64,
            self.height as f64,
        );

        self.surface = Some(Surface::from_raw_none(pdfs));

        self.surface
    }

    unsafe fn destroy_surface(&mut self, env: &mut Env) {
        if let Some(surface) = &mut self.surface {
            cairo_surface_destroy(surface.to_raw_none());
            self.surface = None;
        }
    }

    unsafe fn recreate_surface(&mut self, env: &mut Env) -> Option<Surface> {
        cairo_pdf_surface_set_size(
            self.surface.unwrap().to_raw_none(),
            self.width as f64,
            self.height as f64,
        );

        self.surface
    }

    unsafe fn set_canvas(&mut self, canvas: Canvas) {
        self.canvas = canvas;
    }
}

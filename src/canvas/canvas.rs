use cairo::{ffi::{cairo_status_t, cairo_image_surface_get_data, cairo_image_surface_get_stride}, Surface, Context};
use napi::{JsBuffer, Env};
use napi_derive::napi;
use pango::{FontDescription, ffi::{PangoWeight, PangoStyle, PangoFontDescription}};

use crate::backends::backend::{BackendTrait, BaseBackend};

#[derive(Debug, Clone)]
pub struct FontFace {
    pub sys_desc: FontDescription,
    pub user_desc: FontDescription,
    pub file_path: [char; 1024],
}

impl Default for FontFace {
    fn default() -> Self {
        Self {
            sys_desc: FontDescription::default(),
            user_desc: FontDescription::default(),
            file_path: [char::default(); 1024],
        }
    }
}

pub enum TextBaseline {
    Alphabetic = 0,
    Top = 1,
    Bottom = 2,
    Middle = 3,
    Ideographic = 4,
    Hanging = 5,
}

pub enum TextAlign {
    Left = -1,
    Center = 0,
    Right = 1,
    Start = -2,
    End = 2,
}

pub enum CanvasDrawMode {
    Paths,
    Glyphs,
}

#[napi]
#[derive(Debug, Clone, Default)]
pub struct Canvas<B = BaseBackend> {
    backend: B,
}

impl<B: BackendTrait> Canvas<B> {
    pub fn new(backend: B) {
        Self {
            backend,
        }
    }

    pub fn error(status: cairo_status_t) -> String {}

    pub async fn to_png_buffer_async(&self) -> &[u8] {}
    pub async fn to_jpeg_buffer_async(&self) -> &[u8] {}
    pub async fn to_buffer_async_after(&self) -> &[u8] {}

    pub fn to_buffer(&self) -> JsBuffer {}

    pub fn stream_png_sync(&self) {}
    pub fn stream_jpeg_sync(&self) {}
    pub fn stream_pdf_sync(&self) {}

    pub fn register_font(&mut self) {}
    pub fn deregister_all_fonts(&mut self) {}

    pub fn get_weight_from_css_string(weight: String) -> PangoWeight {}
    pub fn get_style_from_css_string(style: String) -> PangoStyle {}
    pub fn resolve_font_description(desc: PangoFontDescription) -> PangoFontDescription {}

    pub fn resurface(canvas: Canvas) {}

    pub fn backend(&self) -> B {
        self.backend
    }

    pub fn surface(&self) -> Option<Surface> {
        self.backend.get_surface()
    }

    pub fn create_cairo_context(&self) -> Context {}

    pub unsafe fn data(&self) -> u8 {
        cairo_image_surface_get_data(self.surface().unwrap().to_raw_none())
    }

    pub unsafe fn stride(&self) -> i32 {
        cairo_image_surface_get_stride(self.surface().unwrap().to_raw_none())
    }

    pub unsafe fn n_bytes(&self) -> i32 {
        self.get_height() * self.stride()
    }

    pub fn get_width(&self) -> i32 {
        self.backend.get_width()
    }

    pub fn get_height(&self) -> i32 {
        self.backend.get_height()
    }

    pub unsafe fn set_width(&mut self, width: i32, env: &mut Env) {
        self.backend.set_width(width, env);
    }

    pub unsafe fn set_height(&mut self, height: i32, env: &mut Env) {
        self.backend.set_height(height, env);
    }
}

use napi::bindgen_prelude::Either3;

use crate::{
    alias_property_borrow,
    canvas::{
        canvas::Canvas, cap::LineCap, gradient::CanvasGradient, join::LineJoin, mode::AliasingMode,
        operation::GlobalCompositeOperation, pattern::CanvasPattern,
    },
    dom::matrix::DomMatrix,
    image::quality::Quality,
    text::{align::TextAlign, baseline::TextBaseline, mode::TextDrawingMode},
};

#[napi]
#[derive(Debug, Clone, PartialEq, PartialOrd, Default, Serialize, Deserialize)]
pub struct CanvasRenderingContext2d {
    pub pattern_quality: Quality,
    pub quality: Quality,
    pub text_drawing_mode: TextDrawingMode,
    pub antialias: AliasingMode,
    pub line_width: i32,
    pub line_cap: LineCap,
    pub line_join: LineJoin,
    pub miter_limit: i32,
    pub line_dash_offset: i32,
    pub font: String,
    pub text_align: TextAlign,
    pub text_baseline: TextBaseline,
    pub shadow_blur: i32,
    pub shadow_color: String,
    pub shadow_offset_x: i32,
    pub shadow_offset_y: i32,
    pub global_alpha: i32,
    pub global_composite_operation: GlobalCompositeOperation,
    pub image_smoothing_enabled: bool,

    fill_style: Option<String>,
    fill_gradient: Option<CanvasGradient>,
    fill_pattern: Option<CanvasPattern>,

    stroke_style: Option<String>,
    stroke_gradient: Option<CanvasGradient>,
    stroke_pattern: Option<CanvasPattern>,

    current_transform: DomMatrix,
    canvas: Canvas,
}

#[napi]
impl CanvasRenderingContext2d {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self::default()
    }

    #[napi(getter)]
    pub fn get_fill_style(&self) -> Option<Either3<String, CanvasGradient, CanvasPattern>> {
        if let Some(style) = self.fill_style.clone() {
            Some(Either3::A(style))
        } else if let Some(gradient) = self.fill_gradient {
            Some(Either3::B(gradient))
        } else if let Some(pattern) = self.fill_pattern {
            Some(Either3::C(pattern))
        } else {
            None
        }
    }

    #[napi(setter)]
    pub fn set_fill_style(&mut self, style: Either3<String, &CanvasGradient, &CanvasPattern>) {
        match style {
            Either3::A(val) => self.fill_style = Some(val),
            Either3::B(val) => self.fill_gradient = Some(val.clone()),
            Either3::C(val) => self.fill_pattern = Some(val.clone()),
        }
    }

    #[napi(getter)]
    pub fn get_stroke_style(&self) -> Option<Either3<String, CanvasGradient, CanvasPattern>> {
        if let Some(style) = self.stroke_style.clone() {
            Some(Either3::A(style))
        } else if let Some(gradient) = self.stroke_gradient {
            Some(Either3::B(gradient))
        } else if let Some(pattern) = self.stroke_pattern {
            Some(Either3::C(pattern))
        } else {
            None
        }
    }

    #[napi(setter)]
    pub fn set_stroke_style(&mut self, style: Either3<String, &CanvasGradient, &CanvasPattern>) {
        match style {
            Either3::A(val) => self.stroke_style = Some(val),
            Either3::B(val) => self.stroke_gradient = Some(val.clone()),
            Either3::C(val) => self.stroke_pattern = Some(val.clone()),
        }
    }
}

alias_property_borrow!(
    CanvasRenderingContext2d,
    DomMatrix,
    currentTransform,
    current_transform
);

alias_property_borrow!(CanvasRenderingContext2d, Canvas, canvas, canvas);

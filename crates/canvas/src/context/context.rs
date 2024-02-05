use csscolorparser::parse;
use raqote::{BlendMode, Color, DrawOptions, DrawTarget, StrokeStyle};

use crate::{
    alias_property_borrow,
    canvas::{
        canvas::Canvas, cap::LineCap, join::LineJoin, mode::AliasingMode,
        operation::GlobalCompositeOperation,
    },
    dom::matrix::DomMatrix,
    image::quality::Quality,
    text::{align::TextAlign, baseline::TextBaseline, mode::TextDrawingMode},
};

pub const DEFAULT_COLOR: &str = "black";

#[napi]
#[derive(Debug, Clone)]
pub struct CanvasRenderingContext2d {
    pub pattern_quality: Quality,
    pub quality: Quality,
    pub text_drawing_mode: TextDrawingMode,
    pub antialias: AliasingMode,
    pub line_width: f64,
    pub line_cap: LineCap,
    pub line_join: LineJoin,
    pub miter_limit: f64,
    pub line_dash_offset: f64,
    pub font: String,
    pub text_align: TextAlign,
    pub text_baseline: TextBaseline,
    pub shadow_blur: f64,
    pub shadow_color: String,
    pub shadow_offset_x: f64,
    pub shadow_offset_y: f64,
    pub global_alpha: f64,
    pub global_composite_operation: GlobalCompositeOperation,
    pub image_smoothing_enabled: bool,
    pub fill_style: Option<String>,
    pub stroke_style: Option<String>,

    pub(crate) current_transform: DomMatrix,
    pub(crate) canvas: Canvas,
    pub(crate) target: DrawTarget,
}

#[napi]
impl CanvasRenderingContext2d {
    #[napi(constructor)]
    pub fn new(canvas: &Canvas) -> Self {
        Self {
            pattern_quality: Default::default(),
            quality: Default::default(),
            text_drawing_mode: Default::default(),
            antialias: Default::default(),
            line_width: Default::default(),
            line_cap: Default::default(),
            line_join: Default::default(),
            miter_limit: Default::default(),
            line_dash_offset: Default::default(),
            font: Default::default(),
            text_align: Default::default(),
            text_baseline: Default::default(),
            shadow_blur: Default::default(),
            shadow_color: Default::default(),
            shadow_offset_x: Default::default(),
            shadow_offset_y: Default::default(),
            global_alpha: Default::default(),
            global_composite_operation: Default::default(),
            image_smoothing_enabled: Default::default(),
            fill_style: Default::default(),
            stroke_style: Default::default(),
            current_transform: Default::default(),
            canvas: canvas.clone(),
            target: canvas.clone().target,
        }
    }
}

impl CanvasRenderingContext2d {
    pub fn get_options(&self) -> DrawOptions {
        DrawOptions {
            blend_mode: BlendMode::SrcOver,
            alpha: self.global_alpha as f32,
            antialias: self.antialias.into_raqote(),
        }
    }

    pub fn get_stroke_style(&self) -> StrokeStyle {
        StrokeStyle {
            cap: self.line_cap.into_raqote(),
            dash_array: Vec::new(),
            dash_offset: self.line_dash_offset as f32,
            join: self.line_join.into_raqote(),
            miter_limit: self.miter_limit as f32,
            width: self.line_width as f32,
        }
    }

    pub fn get_fill_color(&self) -> Color {
        let color = self.fill_style.clone().unwrap_or(DEFAULT_COLOR.to_string());
        let [r, g, b, a] = parse(&color).unwrap().to_rgba8();

        Color::new(a, r, g, b)
    }

    pub fn get_stroke_color(&self) -> Color {
        let color = self
            .stroke_style
            .clone()
            .unwrap_or(DEFAULT_COLOR.to_string());

        let [r, g, b, a] = parse(&color).unwrap().to_rgba8();

        Color::new(a, r, g, b)
    }
}

alias_property_borrow!(
    CanvasRenderingContext2d,
    DomMatrix,
    currentTransform,
    current_transform
);

alias_property_borrow!(CanvasRenderingContext2d, Canvas, canvas, canvas);

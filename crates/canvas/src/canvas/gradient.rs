use csscolorparser::parse;
use raqote::{GradientStop, Color};

#[napi]
#[derive(
    Debug, Clone, Default,
)]
pub struct CanvasGradient {
    stops: Vec<GradientStop>,
}

#[napi]
impl CanvasGradient {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self::default()
    }

    #[napi]
    pub fn add_color_stop(&mut self, offset: f64, color: String) {
        let offset = offset as f32;
        let [r, g, b, a] = parse(&color).unwrap().to_rgba8();
        let color = Color::new(a, r, g, b);

        self.stops.push(GradientStop {
            position: offset,
            color,
        });
    }
}

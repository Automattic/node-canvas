use font_kit::{font::Font, source::SystemSource};
use raqote::{DrawOptions, Point, SolidSource, Source};

use super::context::CanvasRenderingContext2d;

impl CanvasRenderingContext2d {
    pub fn get_font(&self) -> Font {
        // TODO: Get from self.font
        SystemSource::new()
            .select_family_by_name("Arial")
            .unwrap()
            .fonts()[0]
            .load()
            .unwrap()
    }

    // TODO: Use max_w
    pub fn fill_text(&mut self, text: String, x: f64, y: f64, _max_w: Option<f64>) {
        // TODO: Get from self.font
        let font_size = 12.0;

        self.target.draw_text(
            &self.get_font(),
            font_size,
            &text,
            Point::new(x as f32, y as f32),
            &Source::Solid(SolidSource::from(self.get_stroke_color())),
            &DrawOptions {
                alpha: self.global_alpha as f32,
                antialias: self.antialias.into_raqote(),
                ..Default::default()
            },
        )
    }
}

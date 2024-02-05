use raqote::{PathBuilder, SolidSource, Source};

use super::context::CanvasRenderingContext2d;

#[napi]
impl CanvasRenderingContext2d {
    #[napi]
    pub fn clear_rect(&mut self, x: f64, y: f64, width: f64, height: f64) {
        self.target.fill_rect(
            x as f32,
            y as f32,
            width as f32,
            height as f32,
            &Source::Solid(SolidSource {
                a: 0,
                b: 0,
                g: 0,
                r: 0,
            }),
            &self.get_options(),
        );
    }

    #[napi]
    pub fn fill_rect(&mut self, x: f64, y: f64, width: f64, height: f64) {
        self.target.fill_rect(
            x as f32,
            y as f32,
            width as f32,
            height as f32,
            &Source::Solid(SolidSource::from(self.get_fill_color())),
            &self.get_options(),
        );
    }

    #[napi]
    pub fn stroke_rect(&mut self, x: f64, y: f64, width: f64, height: f64) {
        let mut path = PathBuilder::new();

        path.rect(x as f32, y as f32, width as f32, height as f32);

        let path = path.finish();

        self.target.stroke(
            &path,
            &Source::Solid(SolidSource::from(self.get_stroke_color())),
            &self.get_stroke_style(),
            &self.get_options(),
        );
    }
}

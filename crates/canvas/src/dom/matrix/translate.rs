use super::DomMatrix;

impl DomMatrix {
    pub fn translate(&self, x: f64, y: Option<f64>, z: Option<f64>) -> Self {
        self.clone().translate_self(x, y, z)
    }

    pub fn translate_self(&mut self, x: f64, y: Option<f64>, z: Option<f64>) -> Self {
        let y = y.unwrap_or(0.0);
        let z = z.unwrap_or(0.0);
        let mut tmp = Self::identity();

        tmp.m41 = x;
        tmp.m42 = y;
        tmp.m43 = z;

        self.multiply_self(tmp)
    }
}

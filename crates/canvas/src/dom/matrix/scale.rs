use super::DomMatrix;

impl DomMatrix {
    pub fn scale(&self, x: f64, y: Option<f64>, z: Option<f64>) -> Self {
        self.clone().scale_self(x, y, z)
    }

    pub fn scale_self(&mut self, x: f64, y: Option<f64>, z: Option<f64>) -> Self {
        let y = y.unwrap_or(x);
        let z = z.unwrap_or(1.0);
        let mut tmp = Self::identity();

        tmp.m11 = x;
        tmp.m22 = y;
        tmp.m33 = z;

        self.multiply_self(tmp)
    }
}

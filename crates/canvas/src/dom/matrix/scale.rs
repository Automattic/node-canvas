use super::DomMatrix;

#[napi]
impl DomMatrix {
    #[napi]
    pub fn scale(
        &self,
        x: Option<f64>,
        y: Option<f64>,
        z: Option<f64>,
        ox: Option<f64>,
        oy: Option<f64>,
        oz: Option<f64>,
    ) -> Self {
        self.clone().scale_self(x, y, z, ox, oy, oz)
    }

    #[napi]
    pub fn scale_3d(
        &self,
        scale: Option<f64>,
        ox: Option<f64>,
        oy: Option<f64>,
        oz: Option<f64>,
    ) -> Self {
        self.clone().scale_3d_self(scale, ox, oy, oz)
    }

    #[napi]
    pub fn scale_3d_self(
        &mut self,
        scale: Option<f64>,
        ox: Option<f64>,
        oy: Option<f64>,
        oz: Option<f64>,
    ) -> Self {
        self.scale_self(scale, scale, scale, ox, oy, oz)
    }

    #[napi]
    pub fn scale_self(
        &mut self,
        x: Option<f64>,
        y: Option<f64>,
        z: Option<f64>,
        ox: Option<f64>,
        oy: Option<f64>,
        oz: Option<f64>,
    ) -> Self {
        let x = x.unwrap_or(1.0);
        let y = y.unwrap_or(x);
        let z = z.unwrap_or(1.0);
        let ox = ox.unwrap_or(0.0);
        let oy = oy.unwrap_or(0.0);
        let oz = oz.unwrap_or(0.0);

        self.translate_self(ox, Some(oy), Some(oz));

        let mut tmp = Self::identity();

        tmp.m11 = x;
        tmp.m22 = y;
        tmp.m33 = z;

        *self = tmp * *self;

        self.translate_self(-ox, Some(-oy), Some(-oz));

        *self
    }
}

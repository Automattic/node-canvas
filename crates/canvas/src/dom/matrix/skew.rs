use std::f64::consts::PI;

use super::DomMatrix;

impl DomMatrix {
    pub fn skew_x(&self, angle: f64) -> Self {
        self.clone().skew_x_self(angle)
    }

    pub fn skew_y(&self, angle: f64) -> Self {
        self.clone().skew_y_self(angle)
    }

    pub fn skew(&self, angle_x: f64, angle_y: f64) -> Self {
        self.clone().skew_self(angle_x, angle_y)
    }

    pub fn skew_x_self(&mut self, angle: f64) -> Self {
        self.skew_self(angle, 0.0)
    }

    pub fn skew_y_self(&mut self, angle: f64) -> Self {
        self.skew_self(0.0, angle)
    }

    pub fn skew_self(&mut self, angle_x: f64, angle_y: f64) -> Self {
        let mut tmp = Self::identity();

        if angle_x > 0.0 {
            let rad_x = (angle_x * PI) / 180.0;
            let tan_x = rad_x.tan();

            tmp.m21 = tan_x;
        }

        if angle_y > 0.0 {
            let rad_y = (angle_y * PI) / 180.0;
            let tan_y = rad_y.tan();

            tmp.m12 = tan_y;
        }

        self.multiply_self(tmp)
    }
}

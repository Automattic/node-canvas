use super::{DomMatrix, DEG_TO_RAD, PI_360};

impl DomMatrix {
    pub fn rotate(&self, rx: f64, ry: Option<f64>, rz: Option<f64>) -> Self {
        self.clone().rotate_self(rx, ry, rz)
    }

    pub fn rotate_self(&mut self, mut rx: f64, o_ry: Option<f64>, o_rz: Option<f64>) -> Self {
        let mut ry = o_ry.unwrap_or(0.0);
        let mut rz = o_rz.unwrap_or(0.0);

        if o_ry.is_none() && o_rz.is_none() {
            rz = rx;
            rx = 0.0;
            ry = 0.0;
        }

        let mut tmp = Self::identity();

        let rad_x = rx * DEG_TO_RAD;
        let rad_y = ry * DEG_TO_RAD;
        let rad_z = rz * DEG_TO_RAD;

        let cos_x = rad_x.cos();
        let sin_x = -rad_x.sin();
        let cos_y = rad_y.cos();
        let sin_y = -rad_y.sin();
        let cos_z = rad_z.cos();
        let sin_z = -rad_z.sin();

        let m11 = cos_y * cos_z;
        let m12 = -cos_y * sin_z;
        let m21 = sin_x * sin_y * cos_z + cos_x * sin_z;
        let m22 = cos_x * cos_z - sin_x * sin_y * sin_z;

        tmp.m11 = m11;
        tmp.m12 = m12;
        tmp.m13 = sin_y;
        tmp.m21 = m21;
        tmp.m22 = m22;
        tmp.m23 = -sin_x * cos_y;
        tmp.m31 = sin_x * sin_z - cos_x * sin_y * cos_z;
        tmp.m32 = sin_x * cos_z + cos_x * sin_y * sin_z;
        tmp.m33 = cos_x * cos_y;

        self.multiply_self(tmp)
    }

    pub fn rotate_axis_angle(&self, x: f64, y: f64, z: f64, alpha: f64) -> Self {
        self.clone().rotate_axis_angle_self(x, y, z, alpha)
    }

    pub fn rotate_axis_angle_self(&mut self, x: f64, y: f64, z: f64, alpha: f64) -> Self {
        if [x, y, z, alpha].iter().any(|v| v.abs().is_nan()) {
            panic!("Values cannot be NaN!");
        }

        let mut tmp = Self::identity();
        let len = (x * x + y * y + z * z).sqrt();

        if len == 0.0 {
            return tmp;
        }

        let x = x / len;
        let y = y / len;
        let z = z / len;

        let angle = alpha * PI_360;
        let sin_a = angle.sin();
        let cos_a = angle.cos();
        let sin_a2 = sin_a * sin_a;

        let x2 = x * x;
        let y2 = y * y;
        let z2 = z * z;

        let m11 = 1.0 - 2.0 * (y2 + z2) * sin_a2;
        let m12 = 2.0 * (x * y * sin_a2 + z * sin_a * cos_a);
        let m21 = 2.0 * (y * x * sin_a2 - z * sin_a * cos_a);
        let m22 = 1.0 - 2.0 * (z2 + x2) * sin_a2;

        tmp.m11 = m11;
        tmp.m12 = m12;
        tmp.m13 = 2.0 * (x * z * sin_a2 - y * sin_a * cos_a);
        tmp.m21 = m21;
        tmp.m22 = m22;
        tmp.m23 = 2.0 * (y * z * sin_a2 + x * sin_a * cos_a);
        tmp.m31 = 2.0 * (z * x * sin_a2 + y * sin_a * cos_a);
        tmp.m32 = 2.0 * (z * y * sin_a2 - x * sin_a * cos_a);
        tmp.m33 = 1.0 - 2.0 * (x2 + y2) * sin_a2;

        self.multiply_self(tmp)
    }
}

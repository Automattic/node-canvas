use std::f64::consts::FRAC_PI_2;

use euclid::Angle;

use super::{util::multiply_matrices, DomMatrix, DEG_PER_RAD, RAD_PER_DEG};

#[napi]
impl DomMatrix {
    #[napi]
    pub fn translate(&mut self, tx: Option<f64>, ty: Option<f64>, tz: Option<f64>) {
        let tx = tx.unwrap_or(0.0);
        let ty = ty.unwrap_or(0.0);
        let tz = tz.unwrap_or(0.0);

        self.set_values(
            multiply_matrices(
                [
                    1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, tx, ty, tz, 1.0,
                ],
                self.values(),
            )
            .to_vec(),
        );
    }

    #[napi]
    pub fn scale_3d(
        &mut self,
        scale: Option<f64>,
        ox: Option<f64>,
        oy: Option<f64>,
        oz: Option<f64>,
    ) {
        self.scale(scale, scale, scale, ox, oy, oz);
    }

    #[napi]
    pub fn scale(
        &mut self,
        sx: Option<f64>,
        sy: Option<f64>,
        sz: Option<f64>,
        ox: Option<f64>,
        oy: Option<f64>,
        oz: Option<f64>,
    ) {
        let sx = sx.unwrap_or(0.0);
        let sy = sy.unwrap_or(0.0);
        let sz = sz.unwrap_or(0.0);

        self.translate(Some(sx), Some(sy), Some(sz));

        let ox = ox.unwrap_or(0.0);
        let oy = oy.unwrap_or(0.0);
        let oz = oz.unwrap_or(0.0);

        self.set_values(
            multiply_matrices(
                [
                    sx, 0.0, 0.0, 0.0, 0.0, sy, 0.0, 0.0, 0.0, 0.0, sz, 0.0, 0.0, 0.0, 0.0, 1.0,
                ],
                self.values(),
            )
            .to_vec(),
        );

        self.translate(Some(-ox), Some(-oy), Some(-oz));
    }

    #[napi]
    pub fn rotate_from_vector(&mut self, x: Option<f64>, y: Option<f64>) {
        let x = x.unwrap_or(0.0);
        let y = y.unwrap_or(0.0);
        let theta = if x == 0.0 && y == 0.0 {
            0.0
        } else {
            y.atan2(x) * DEG_PER_RAD
        };

        self.rotate(theta, None, None);
    }

    #[napi]
    pub fn rotate(&mut self, rx: f64, ry: Option<f64>, rz: Option<f64>) {
        self.inner = self.inner.pre_rotate(
            rx,
            ry.unwrap_or(0.0),
            rz.unwrap_or(0.0),
            Angle::radians(FRAC_PI_2),
        );
    }

    #[napi]
    pub fn rotate_axis_angle(
        &mut self,
        x: Option<f64>,
        y: Option<f64>,
        z: Option<f64>,
        mut angle: f64,
    ) {
        let mut x = x.unwrap_or(0.0);
        let mut y = y.unwrap_or(0.0);
        let mut z = z.unwrap_or(0.0);
        let len = (x * x + y * y + z * z).sqrt();

        if len == 0.0 {
            return;
        }

        if len != -1.0 {
            x /= len;
            y /= len;
            z /= len;
        }

        angle *= RAD_PER_DEG;

        let c = angle.cos();
        let s = angle.sin();
        let t = 1.0 - c;
        let tx = t * x;
        let ty = t * y;

        self.set_values(
            multiply_matrices(
                [
                    tx * x + c,
                    tx * y + s * z,
                    tx * z - s * y,
                    0.0,
                    tx * y - s * z,
                    ty * y + c,
                    ty * z + s * x,
                    0.0,
                    tx * z + s * y,
                    ty * z - s * x,
                    t * z * z + c,
                    0.0,
                    0.0,
                    0.0,
                    0.0,
                    1.0,
                ],
                self.values(),
            )
            .to_vec(),
        );
    }

    #[napi]
    pub fn skew_x(&mut self, sx: Option<f64>) {
        let sx = sx.unwrap_or(0.0);
        let t = (sx * RAD_PER_DEG).tan();

        self.set_values(
            multiply_matrices(
                [
                    1.0, 0.0, 0.0, 0.0, t, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                ],
                self.values(),
            )
            .to_vec(),
        );
    }

    #[napi]
    pub fn skew_y(&mut self, sy: Option<f64>) {
        let sy = sy.unwrap_or(0.0);
        let t = (sy * RAD_PER_DEG).tan();

        self.set_values(
            multiply_matrices(
                [
                    1.0, t, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                ],
                self.values(),
            )
            .to_vec(),
        );
    }

    #[napi]
    pub fn flip_x(&mut self) {
        self.set_values(
            multiply_matrices(
                [
                    -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                ],
                self.values(),
            )
            .to_vec(),
        );
    }

    #[napi]
    pub fn flip_y(&mut self) {
        self.set_values(
            multiply_matrices(
                [
                    1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                ],
                self.values(),
            )
            .to_vec(),
        );
    }

    #[napi]
    pub fn inverse(&mut self) {
        let m: [f64; 16] = self.values();
        let mut inv = [0.0; 16];

        inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15]
            + m[9] * m[7] * m[14]
            + m[13] * m[6] * m[11]
            - m[13] * m[7] * m[10];

        inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15]
            - m[8] * m[7] * m[14]
            - m[12] * m[6] * m[11]
            + m[12] * m[7] * m[10];

        inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15]
            + m[8] * m[7] * m[13]
            + m[12] * m[5] * m[11]
            - m[12] * m[7] * m[9];

        inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14]
            - m[8] * m[6] * m[13]
            - m[12] * m[5] * m[10]
            + m[12] * m[6] * m[9];

        let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

        if det == 0.0 {
            self.set_values([f64::NAN; 16].to_vec());
            return;
        }

        inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15]
            - m[9] * m[3] * m[14]
            - m[13] * m[2] * m[11]
            + m[13] * m[3] * m[10];

        inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15]
            + m[8] * m[3] * m[14]
            + m[12] * m[2] * m[11]
            - m[12] * m[3] * m[10];

        inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15]
            - m[8] * m[3] * m[13]
            - m[12] * m[1] * m[11]
            + m[12] * m[3] * m[9];

        inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14]
            + m[8] * m[2] * m[13]
            + m[12] * m[1] * m[10]
            - m[12] * m[2] * m[9];

        inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15]
            + m[5] * m[3] * m[14]
            + m[13] * m[2] * m[7]
            - m[13] * m[3] * m[6];

        inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15]
            - m[4] * m[3] * m[14]
            - m[12] * m[2] * m[7]
            + m[12] * m[3] * m[6];

        inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15]
            + m[4] * m[3] * m[13]
            + m[12] * m[1] * m[7]
            - m[12] * m[3] * m[5];

        inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14]
            - m[4] * m[2] * m[13]
            - m[12] * m[1] * m[6]
            + m[12] * m[2] * m[5];

        inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11]
            - m[5] * m[3] * m[10]
            - m[9] * m[2] * m[7]
            + m[9] * m[3] * m[6];

        inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11]
            + m[4] * m[3] * m[10]
            + m[8] * m[2] * m[7]
            - m[8] * m[3] * m[6];

        inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11]
            - m[4] * m[3] * m[9]
            - m[8] * m[1] * m[7]
            + m[8] * m[3] * m[5];

        inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10]
            + m[4] * m[2] * m[9]
            + m[8] * m[1] * m[6]
            - m[8] * m[2] * m[5];

        for (i, v) in inv.clone().iter().enumerate() {
            inv[i] = *v / det;
        }

        self.set_values(inv.to_vec());
    }

    #[napi]
    pub fn set_matrix_value(&mut self, transform_list: Vec<f64>) {
        let temp = DomMatrix::new(Some(transform_list));

        self.set_values(temp.values().to_vec());
    }
}

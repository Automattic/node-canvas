use super::DomMatrix;

#[napi]
impl DomMatrix {
    #[napi]
    pub fn values(&self) -> [f64; 16] {
        [
            self.m11, self.m12, self.m13, self.m14, self.m21, self.m22, self.m23, self.m24,
            self.m31, self.m32, self.m33, self.m34, self.m41, self.m42, self.m43, self.m44,
        ]
    }

    #[napi]
    pub fn set_values(&mut self, values: Vec<f64>) -> Self {
        if values.len() == 16 {
            self.m11 = values[0];
            self.m12 = values[1];
            self.m13 = values[2];
            self.m14 = values[3];
            self.m21 = values[4];
            self.m22 = values[5];
            self.m23 = values[6];
            self.m24 = values[7];
            self.m31 = values[8];
            self.m32 = values[9];
            self.m33 = values[10];
            self.m34 = values[11];
            self.m41 = values[12];
            self.m42 = values[13];
            self.m43 = values[14];
            self.m44 = values[15];
        } else if values.len() == 6 {
            self.m11 = values[0];
            self.m12 = values[1];
            self.m21 = values[2];
            self.m22 = values[3];
            self.m41 = values[4];
            self.m42 = values[5];
        } else {
            panic!("Values must be either 6 or 16 elements long!");
        }

        *self
    }

    #[napi]
    pub fn set_matrix_value(&mut self, transform_list: Vec<f64>) {
        let temp = DomMatrix::new(Some(transform_list));

        self.set_values(temp.values().to_vec());
    }
}

use super::DomMatrix;

impl DomMatrix {
    pub fn flip_x(&self) -> Self {
        self.clone().flip_x_self()
    }

    pub fn flip_y(&self) -> Self {
        self.clone().flip_y_self()
    }

    pub fn flip_x_self(&mut self) -> Self {
        let mut tmp = Self::identity();

        tmp.m11 = -1.0;

        *self = tmp * *self;
        *self
    }

    pub fn flip_y_self(&mut self) -> Self {
        let mut tmp = Self::identity();

        tmp.m22 = -1.0;

        *self = tmp * *self;
        *self
    }
}

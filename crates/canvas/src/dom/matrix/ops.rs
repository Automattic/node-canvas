use std::ops::{Mul, MulAssign};

use super::{util::multiply_matrices, DomMatrix};

#[napi]
impl Mul for DomMatrix {
    type Output = Self;

    fn mul(self, rhs: Self) -> Self::Output {
        let mut me = self.clone();
        me *= rhs;
        me
    }
}

#[napi]
impl MulAssign for DomMatrix {
    fn mul_assign(&mut self, rhs: Self) {
        self.set_values(multiply_matrices(rhs.values(), self.values()).to_vec());

        if !rhs.is_2d {
            self.is_2d = false;
        }
    }
}

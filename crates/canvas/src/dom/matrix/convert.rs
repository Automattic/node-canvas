use crate::util::clone_into_array;

use super::{
    parse::{parse_transform_unchecked, TRANSFORM_REGEX},
    DomMatrix,
};

impl From<Box<[f64]>> for DomMatrix {
    fn from(value: Box<[f64]>) -> Self {
        Self::from(value.to_vec())
    }
}

impl From<Vec<f64>> for DomMatrix {
    fn from(value: Vec<f64>) -> Self {
        Self::from(value.as_slice())
    }
}

impl<'a> From<&'a [f64]> for DomMatrix {
    fn from(init: &'a [f64]) -> Self {
        if init.len() == 6 {
            Self::from(clone_into_array::<[f64; 6], f64>(&init[0..6]))
        } else if init.len() == 16 {
            Self::from(clone_into_array::<[f64; 16], f64>(&init[0..16]))
        } else {
            // No way to return an error :(
            Self::identity()
        }
    }
}

impl From<[f64; 6]> for DomMatrix {
    fn from(init: [f64; 6]) -> Self {
        Self::identity().set_values(init.to_vec())
    }
}

impl From<[f64; 16]> for DomMatrix {
    fn from(init: [f64; 16]) -> Self {
        Self::identity().set_values(init.to_vec())
    }
}

impl From<[f32; 6]> for DomMatrix {
    fn from(value: [f32; 6]) -> Self {
        DomMatrix::from(value.map(|v| v as f64))
    }
}

impl From<[f32; 16]> for DomMatrix {
    fn from(value: [f32; 16]) -> Self {
        DomMatrix::from(value.map(|v| v as f64))
    }
}

impl From<String> for DomMatrix {
    fn from(init: String) -> Self {
        if init.is_empty() {
            Self::identity()
        } else {
            let transforms = TRANSFORM_REGEX
                .splitn(&init, 20)
                .map(parse_transform_unchecked)
                .collect::<Vec<[f64; 16]>>();

            if transforms.is_empty() {
                Self::default()
            } else {
                let mut init = DomMatrix::from(transforms[0]);

                for transform in transforms {
                    init.multiply_self(DomMatrix::from(transform));
                }

                init
            }
        }
    }
}

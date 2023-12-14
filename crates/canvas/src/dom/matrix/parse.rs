use anyhow::Result;
use once_cell::sync::Lazy;
use regex::Regex;

use crate::util::clone_into_array;

use super::{util::multiply_matrices, DomMatrix};

pub static TRANSFORM_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"\)\s+").unwrap());

pub fn parse_matrix(data: &str) -> Result<[f64; 16]> {
    let parsed = data.replace("matrix(", "");
    let parsed = parsed.splitn(7, ",").collect::<Vec<&str>>();

    if parsed.len() != 6 {
        Err(anyhow!("Failed to parse matrix: {}", data))
    } else {
        let parsed = parsed
            .iter()
            .map(|v| v.parse::<f64>().unwrap())
            .collect::<Vec<f64>>();

        Ok([
            parsed[0], parsed[1], 0.0, 0.0, parsed[2], parsed[3], 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
            parsed[4], parsed[5], 0.0, 1.0,
        ])
    }
}

pub fn parse_matrix3d(data: &str) -> Result<[f64; 16]> {
    let parsed = data.replace("matrix3d(", "");
    let parsed = parsed.splitn(17, ",").collect::<Vec<&str>>();

    if parsed.len() != 16 {
        Err(anyhow!("Failed to parse matrix: {}", data))
    } else {
        Ok(clone_into_array(
            parsed
                .iter()
                .map(|v| v.parse::<f64>().unwrap())
                .collect::<Vec<f64>>()
                .as_slice(),
        ))
    }
}

pub fn parse_transform(data: &str) -> Result<[f64; 16]> {
    let kind = data.splitn(1, "(").nth(0).unwrap();

    match kind {
        "matrix" => parse_matrix(data),
        "matrix3d" => parse_matrix3d(data),
        _ => Err(anyhow!("Unknown transform type!")),
    }
}

pub fn parse_transform_unchecked(data: &str) -> [f64; 16] {
    parse_transform(data).unwrap()
}

#[napi]
impl From<String> for DomMatrix {
    fn from(init: String) -> Self {
        if init.is_empty() {
            Self::default()
        } else {
            let transforms = TRANSFORM_REGEX
                .splitn(&init, 20)
                .map(parse_transform_unchecked)
                .collect::<Vec<[f64; 16]>>();

            if transforms.len() == 0 {
                Self::default()
            } else {
                let mut init = transforms[0];

                for transform in transforms {
                    init = multiply_matrices(init, transform);
                }

                Self::from(init)
            }
        }
    }
}

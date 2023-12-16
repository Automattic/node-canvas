use super::DomMatrix;

impl DomMatrix {
    pub fn from_array(init: Vec<f64>) -> Self {
        Self::from(init)
    }

    pub fn from_string(init: String) -> Self {
        Self::from(init)
    }

    pub fn from_matrix(other: DomMatrix) -> Self {
        other.clone()
    }
}

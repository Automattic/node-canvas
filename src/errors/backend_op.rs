use std::{
    error::Error,
    fmt::{self, Display, Formatter},
};

use crate::backends::backend::BackendTrait;

#[derive(Debug, Clone, Default)]
pub struct BackendOperationNotAvailableSideKick {}

impl fmt::Display for BackendOperationNotAvailableSideKick {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "BackendOperationNotAvailableSideKick is here!")
    }
}

impl Error for BackendOperationNotAvailableSideKick {}

#[derive(Debug, Clone, Default)]
pub struct BackendOperationNotAvailable {
    operation_name: String,
    msg: String,
    source: BackendOperationNotAvailableSideKick,
}

impl Display for BackendOperationNotAvailable {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "BackendOperationNotAvailable {{ operation_name: \"{}\", msg: \"{}\" }}",
            self.operation_name, self.msg
        )
    }
}

impl Error for BackendOperationNotAvailable {
    fn description(&self) -> &str {
        self.msg.as_str()
    }

    fn source(&self) -> Option<&(dyn Error + 'static)> {
        Some(&self.source)
    }
}

impl BackendOperationNotAvailable {
    pub fn new(backend: Box<dyn BackendTrait>, operation_name: String) -> Self {
        let msg = format!(
            "operation {} not supported by backend {}",
            operation_name,
            backend.get_name()
        );

        Self {
            operation_name,
            msg,
            source: BackendOperationNotAvailableSideKick {},
        }
    }
}

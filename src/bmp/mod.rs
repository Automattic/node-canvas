pub mod macros;
pub mod parser;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Status {
    Empty,
    Ok,
    Error,
}

impl Default for Status {
    fn default() -> Self {
        Self::Empty
    }
}

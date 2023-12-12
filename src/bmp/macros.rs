#[macro_export]
macro_rules! E {
    ($self: ident, $cond: expr, $msg: expr) => {
        if ($cond) {
            $self.set_error(String::from($msg));
        }
    };
}

#[macro_export]
macro_rules! EU {
    ($self: ident, $cond: expr, $msg: expr) => {
        if ($cond) {
            $self.set_error_unsupported(String::from($msg));
        }
    };
}

#[macro_export]
macro_rules! EX {
    ($self: ident, $cond: expr, $msg: expr) => {
        if ($cond) {
            $self.set_error_unknown(String::from($msg));
        }
    };
}

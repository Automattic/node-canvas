#[macro_export]
macro_rules! assert_approx_eq {
    ($left: expr, $right: expr) => {
        assert_approx_eq!($left, $right, 0.001);
    };

    ($left: expr, $right: expr, $tolerance: expr) => {
        assert!(
            $right > $left - $tolerance && $right < $left + $tolerance,
            "{}",
            format!(
                "assert_approx_eq!({}, {}, tolerance = {})\n\n    left = {:?}\n    right = {:?}\n\n",
                stringify!($left),
                stringify!($right),
                $tolerance,
                $left,
                $right
            )
        );
    };
}

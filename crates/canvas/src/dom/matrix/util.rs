pub fn multiply_matrices(a: [f64; 16], b: [f64; 16]) -> [f64; 16] {
    let mut dest = [0.0; 16];

    for i in 0..4 {
        for j in 0..4 {
            let mut sum = 0.0;

            for k in 0..4 {
                sum += a[i * 4 + k] * b[k * 4 + j];
            }

            dest[i * 4 + j] = sum;
        }
    }

    dest
}

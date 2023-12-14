/*
 * Copyright 2006 The Android Open Source Project
 *
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE.skia file.
 */
use crate::Point;

pub fn intrect<T: Copy>(x1: T, y1: T, x2: T, y2: T) -> euclid::default::Box2D<T> {
    euclid::default::Box2D::new(euclid::point2(x1, y1), euclid::point2(x2, y2))
}

// we can do this
pub fn valid_unit_divide(mut numer: f32, mut denom: f32, ratio: &mut f32) -> bool {
    if numer < 0. {
        numer = -numer;
        denom = -denom;
    }

    if denom == 0. || numer == 0. || numer >= denom {
        return false;
    }

    let r = numer / denom;
    if r.is_nan() {
        return false;
    }
    debug_assert!(r >= 0. && r < 1.);
    if r == 0. {
        // catch underflow if numer <<<< denom
        return false;
    }
    *ratio = r;

    true
}

pub fn is_not_monotonic(a: f32, b: f32, c: f32) -> bool {
    let ab = a - b;
    let mut bc = b - c;
    if ab < 0. {
        bc = -bc;
    }

    ab == 0. || bc < 0.
}

fn interp(a: f32, b: f32, t: f32) -> f32 {
    debug_assert!(t >= 0. && t <= 1.);
    a + (b - a) * t
}

// Skia does a weird thing where it treats arrays of points as castable to array of floats.
// For now we just duplicate quad_x and quad_y
fn interp_quad_x_coords(src: &[Point; 3], dst: &mut [Point; 5], t: f32) {
    let ab = interp(src[0].x, src[1].x, t);
    let bc = interp(src[1].x, src[2].x, t);

    dst[0].x = src[0].x;
    dst[1].x = ab;
    dst[2].x = interp(ab, bc, t);
    dst[3].x = bc;
    dst[4].x = src[2].x;
}

fn interp_quad_y_coords(src: &[Point; 3], dst: &mut [Point; 5], t: f32) {
    let ab = interp(src[0].y, src[1].y, t);
    let bc = interp(src[1].y, src[2].y, t);

    dst[0].y = src[0].y;
    dst[1].y = ab;
    dst[2].y = interp(ab, bc, t);
    dst[3].y = bc;
    dst[4].y = src[2].y;
}

pub fn chop_quad_at(src: &[Point; 3], dst: &mut [Point; 5], t: f32) {
    debug_assert!(t > 0. && t < 1.);

    interp_quad_x_coords(src, dst, t);
    interp_quad_y_coords(src, dst, t);
}

// ensures that the y values are contiguous
// dst[1].fY = dst[3].fY = dst[2].fY
// I'm not sure why we need this
pub fn flatten_double_quad_extrema(dst: &mut [Point; 5]) {
    dst[1].y = dst[2].y;
    dst[3].y = dst[2].y;
}

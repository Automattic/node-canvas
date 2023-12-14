// This is a simple path stroker. It flattens the path and strokes each segment individually.
// For a recent survey of stroking approaches see "Converting stroked primitives to filled primitives" by Diego Nehab

use crate::path_builder::{Path, PathBuilder, PathOp};
use crate::{Point, Vector};

#[derive(Clone, PartialEq, Debug)]
pub struct StrokeStyle {
    pub width: f32,
    pub cap: LineCap,
    pub join: LineJoin,
    pub miter_limit: f32,
    pub dash_array: Vec<f32>,
    pub dash_offset: f32,
}

impl Default for StrokeStyle {
    fn default() -> Self {
        StrokeStyle {
            width: 1.,
            cap: LineCap::Butt,
            join: LineJoin::Miter,
            miter_limit: 10.,
            dash_array: Vec::new(),
            dash_offset: 0.,
        }
    }
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum LineCap {
    Round,
    Square,
    Butt,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum LineJoin {
    Round,
    Miter,
    Bevel,
}

fn compute_normal(p0: Point, p1: Point) -> Option<Vector> {
    let ux = p1.x - p0.x;
    let uy = p1.y - p0.y;

    // this could overflow f32. Skia in SkPoint::Normalize used to
    // checks for this and used a double in that situation, but was
    // simplified to always use doubles.
    let ulen = ux.hypot(uy);
    if ulen == 0. {
        return None;
    }
    // the normal is perpendicular to the *unit* vector
    Some(Vector::new(-uy / ulen, ux / ulen))
}

fn flip(v: Vector) -> Vector {
    Vector::new(-v.x, -v.y)
}

/* Compute a spline approximation of the arc
centered at xc, yc from the angle a to the angle b

The angle between a and b should not be more than a
quarter circle (pi/2)

The approximation is similar to an approximation given in:
"Approximation of a cubic bezier curve by circular arcs and vice versa"
by Alekas Riškus. However that approximation becomes unstable when the
angle of the arc approaches 0.

This approximation is inspired by a discussion with Boris Zbarsky
and essentially just computes:

  h = 4.0/3.0 * tan ((angle_B - angle_A) / 4.0);

without converting to polar coordinates.

A different way to do this is covered in "Approximation of a cubic bezier
curve by circular arcs and vice versa" by Alekas Riškus. However, the method
presented there doesn't handle arcs with angles close to 0 because it
divides by the perp dot product of the two angle vectors.
*/
fn arc_segment(path: &mut PathBuilder, xc: f32, yc: f32, radius: f32, a: Vector, b: Vector) {
    let r_sin_a = radius * a.y;
    let r_cos_a = radius * a.x;
    let r_sin_b = radius * b.y;
    let r_cos_b = radius * b.x;

    /* bisect the angle between 'a' and 'b' with 'mid' */
    let mut mid = a + b;
    mid /= mid.length();

    /* bisect the angle between 'a' and 'mid' with 'mid2' this is parallel to a
     * line with angle (B - A)/4 */
    let mid2 = a + mid;

    let h = (4. / 3.) * dot(perp(a), mid2) / dot(a, mid2);

    path.cubic_to(
        xc + r_cos_a - h * r_sin_a,
        yc + r_sin_a + h * r_cos_a,
        xc + r_cos_b + h * r_sin_b,
        yc + r_sin_b - h * r_cos_b,
        xc + r_cos_b,
        yc + r_sin_b,
    );
}

/* The angle between the vectors must be <= pi */
fn bisect(a: Vector, b: Vector) -> Vector {
    let mut mid;
    if dot(a, b) >= 0. {
        /* if the angle between a and b is accute, then we can
         * just add the vectors and normalize */
        mid = a + b;
    } else {
        /* otherwise, we can flip a, add it
         * and then use the perpendicular of the result */
        mid = flip(a) + b;
        mid = perp(mid);
    }

    /* normalize */
    /* because we assume that 'a' and 'b' are normalized, we can use
     * sqrt instead of hypot because the range of mid is limited */
    let mid_len = mid.x * mid.x + mid.y * mid.y;
    let len = mid_len.sqrt();
    return mid / len;
}

fn arc(path: &mut PathBuilder, xc: f32, yc: f32, radius: f32, a: Vector, b: Vector) {
    /* find a vector that bisects the angle between a and b */
    let mid_v = bisect(a, b);

    /* construct the arc using two curve segments */
    arc_segment(path, xc, yc, radius, a, mid_v);
    arc_segment(path, xc, yc, radius, mid_v, b);
}

fn join_round(path: &mut PathBuilder, center: Point, a: Vector, b: Vector, radius: f32) {
    /*
    int ccw = dot (perp (b), a) >= 0; // XXX: is this always true?
    yes, otherwise we have an interior angle.
    assert (ccw);
    */
    arc(path, center.x, center.y, radius, a, b);
}

fn cap_line(dest: &mut PathBuilder, style: &StrokeStyle, pt: Point, normal: Vector) {
    let offset = style.width / 2.;
    match style.cap {
        LineCap::Butt => { /* nothing to do */ }
        LineCap::Round => {
            dest.move_to(pt.x + normal.x * offset, pt.y + normal.y * offset);
            arc(dest, pt.x, pt.y, offset, normal, flip(normal));
            dest.line_to(pt.x, pt.y);
            dest.close();
        }
        LineCap::Square => {
            // parallel vector
            let v = Vector::new(normal.y, -normal.x);
            let end = pt + v * offset;
            dest.move_to(pt.x + normal.x * offset, pt.y + normal.y * offset);
            dest.line_to(end.x + normal.x * offset, end.y + normal.y * offset);
            dest.line_to(end.x + -normal.x * offset, end.y + -normal.y * offset);
            dest.line_to(pt.x - normal.x * offset, pt.y - normal.y * offset);
            dest.line_to(pt.x, pt.y);
            dest.close();
        }
    }
}

fn bevel(
    dest: &mut PathBuilder,
    style: &StrokeStyle,
    pt: Point,
    s1_normal: Vector,
    s2_normal: Vector,
) {
    let offset = style.width / 2.;
    dest.move_to(pt.x + s1_normal.x * offset, pt.y + s1_normal.y * offset);
    dest.line_to(pt.x + s2_normal.x * offset, pt.y + s2_normal.y * offset);
    dest.line_to(pt.x, pt.y);
    dest.close();
}

/* given a normal rotate the vector 90 degrees to the right clockwise
 * This function has a period of 4. e.g. swap(swap(swap(swap(x) == x */
fn swap(a: Vector) -> Vector {
    /* one of these needs to be negative. We choose a.x so that we rotate to the right instead of negating */
    Vector::new(a.y, -a.x)
}

fn unperp(a: Vector) -> Vector {
    swap(a)
}

/* rotate a vector 90 degrees to the left */
fn perp(v: Vector) -> Vector {
    Vector::new(-v.y, v.x)
}

fn dot(a: Vector, b: Vector) -> f32 {
    a.x * b.x + a.y * b.y
}

/* Finds the intersection of two lines each defined by a point and a normal.
From "Example 2: Find the intersection of two lines" of
"The Pleasures of "Perp Dot" Products"
F. S. Hill, Jr. */
fn line_intersection(a: Point, a_perp: Vector, b: Point, b_perp: Vector) -> Option<Point> {
    let a_parallel = unperp(a_perp);
    let c = b - a;
    let denom = dot(b_perp, a_parallel);
    if denom == 0.0 {
        return None;
    }

    let t = dot(b_perp, c) / denom;

    let intersection = Point::new(a.x + t * (a_parallel.x), a.y + t * (a_parallel.y));

    Some(intersection)
}

fn is_interior_angle(a: Vector, b: Vector) -> bool {
    /* angles of 180 and 0 degrees will evaluate to 0, however
     * we to treat 180 as an interior angle and 180 as an exterior angle */
    dot(perp(a), b) > 0. || a == b /* 0 degrees is interior */
}

fn join_line(
    dest: &mut PathBuilder,
    style: &StrokeStyle,
    pt: Point,
    mut s1_normal: Vector,
    mut s2_normal: Vector,
) {
    if is_interior_angle(s1_normal, s2_normal) {
        s2_normal = flip(s2_normal);
        s1_normal = flip(s1_normal);
        std::mem::swap(&mut s1_normal, &mut s2_normal);
    }

    // XXX: joining uses `pt` which can cause seams because it lies halfway on a line and the
    // rasterizer may not find exactly the same spot
    let offset = style.width / 2.;
    match style.join {
        LineJoin::Round => {
            dest.move_to(pt.x + s1_normal.x * offset, pt.y + s1_normal.y * offset);
            join_round(dest, pt, s1_normal, s2_normal, offset);
            dest.line_to(pt.x, pt.y);
            dest.close();
        }
        LineJoin::Miter => {
            let in_dot_out = -s1_normal.x * s2_normal.x + -s1_normal.y * s2_normal.y;
            if 2. <= style.miter_limit * style.miter_limit * (1. - in_dot_out) {
                let start = pt + s1_normal * offset;
                let end = pt + s2_normal * offset;
                if let Some(intersection) = line_intersection(start, s1_normal, end, s2_normal) {
                    // We won't have an intersection if the segments are parallel
                    dest.move_to(pt.x + s1_normal.x * offset, pt.y + s1_normal.y * offset);
                    dest.line_to(intersection.x, intersection.y);
                    dest.line_to(pt.x + s2_normal.x * offset, pt.y + s2_normal.y * offset);
                    dest.line_to(pt.x, pt.y);
                    dest.close();
                }
            } else {
                bevel(dest, style, pt, s1_normal, s2_normal);
            }
        }
        LineJoin::Bevel => {
            bevel(dest, style, pt, s1_normal, s2_normal);
        }
    }
}

pub fn stroke_to_path(path: &Path, style: &StrokeStyle) -> Path {
    let mut stroked_path = PathBuilder::new();

    if style.width <= 0. {
        return stroked_path.finish();
    }

    let mut cur_pt = None;
    let mut last_normal = Vector::zero();
    let half_width = style.width / 2.;
    let mut start_point = None;
    for op in &path.ops {
        match *op {
            PathOp::MoveTo(pt) => {
                if let (Some(cur_pt), Some((point, normal))) = (cur_pt, start_point) {
                    // cap end
                    cap_line(&mut stroked_path, style, cur_pt, last_normal);
                    // cap beginning
                    cap_line(&mut stroked_path, style, point, flip(normal));
                }
                start_point = None;
                cur_pt = Some(pt);
            }
            PathOp::LineTo(pt) => {
                if cur_pt.is_none() {
                    start_point = None;
                } else if let Some(cur_pt) = cur_pt {
                    if let Some(normal) = compute_normal(cur_pt, pt) {
                        if start_point.is_none() {
                            start_point = Some((cur_pt, normal));
                        } else {
                            join_line(&mut stroked_path, style, cur_pt, last_normal, normal);
                        }

                        stroked_path.move_to(
                            cur_pt.x + normal.x * half_width,
                            cur_pt.y + normal.y * half_width,
                        );
                        stroked_path
                            .line_to(pt.x + normal.x * half_width, pt.y + normal.y * half_width);
                        // we add a point at the midpoint of the line so that our edge has matching
                        // end points with the edges used for joining. This avoids seams during
                        // rasterization caused by precision differences in the slope and endpoints
                        stroked_path.line_to(pt.x, pt.y);
                        stroked_path
                            .line_to(pt.x + -normal.x * half_width, pt.y + -normal.y * half_width);
                        stroked_path.line_to(
                            cur_pt.x - normal.x * half_width,
                            cur_pt.y - normal.y * half_width,
                        );
                        stroked_path.line_to(cur_pt.x, cur_pt.y);

                        stroked_path.close();

                        last_normal = normal;
                    }
                }
                cur_pt = Some(pt);
            }
            PathOp::Close => {
                if let (Some(cur_pt), Some((end_point, start_normal))) = (cur_pt, start_point) {
                    if let Some(normal) = compute_normal(cur_pt, end_point) {
                        join_line(&mut stroked_path, style, cur_pt, last_normal, normal);

                        // the closing line segment
                        stroked_path.move_to(
                            cur_pt.x + normal.x * half_width,
                            cur_pt.y + normal.y * half_width,
                        );
                        stroked_path.line_to(
                            end_point.x + normal.x * half_width,
                            end_point.y + normal.y * half_width,
                        );
                        stroked_path.line_to(end_point.x, end_point.y);
                        stroked_path.line_to(
                            end_point.x + -normal.x * half_width,
                            end_point.y + -normal.y * half_width,
                        );
                        stroked_path.line_to(
                            cur_pt.x - normal.x * half_width,
                            cur_pt.y - normal.y * half_width,
                        );
                        stroked_path.line_to(cur_pt.x, cur_pt.y);
                        stroked_path.close();

                        join_line(&mut stroked_path, style, end_point, normal, start_normal);
                    } else {
                        join_line(
                            &mut stroked_path,
                            style,
                            end_point,
                            last_normal,
                            start_normal,
                        );
                    }
                }
                cur_pt = start_point.map(|x| x.0);
                start_point = None;
            }
            PathOp::QuadTo(..) => panic!("Only flat paths handled"),
            PathOp::CubicTo(..) => panic!("Only flat paths handled"),
        }
    }
    if let (Some(cur_pt), Some((point, normal))) = (cur_pt, start_point) {
        // cap end
        cap_line(&mut stroked_path, style, cur_pt, last_normal);
        // cap beginning
        cap_line(&mut stroked_path, style, point, flip(normal));
    }
    stroked_path.finish()
}

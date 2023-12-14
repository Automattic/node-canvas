use lyon_geom::Angle;
use lyon_geom::Arc;
use lyon_geom::CubicBezierSegment;
use lyon_geom::QuadraticBezierSegment;

use crate::{Point, Transform, Vector};

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Winding {
    EvenOdd,
    NonZero,
}

#[derive(Clone, Copy, Debug)]
pub enum PathOp {
    MoveTo(Point),
    LineTo(Point),
    QuadTo(Point, Point),
    CubicTo(Point, Point, Point),
    Close,
}

impl PathOp {
    fn transform(self, xform: &Transform) -> PathOp {
        match self {
            PathOp::MoveTo(p) => PathOp::MoveTo(xform.transform_point(p)),
            PathOp::LineTo(p) => PathOp::LineTo(xform.transform_point(p)),
            PathOp::QuadTo(p1, p2) => {
                PathOp::QuadTo(xform.transform_point(p1), xform.transform_point(p2))
            }
            PathOp::CubicTo(p1, p2, p3) => PathOp::CubicTo(
                xform.transform_point(p1),
                xform.transform_point(p2),
                xform.transform_point(p3),
            ),
            PathOp::Close => PathOp::Close,
        }
    }
}

/// Represents a complete path usable for filling or stroking.
#[derive(Clone, Debug)]
pub struct Path {
    pub ops: Vec<PathOp>,
    pub winding: Winding,
}

impl Path {
    /// Flattens `self` by replacing all QuadTo and CurveTo
    /// commands with an appropriate number of LineTo commands
    /// so that the error is not greater than `tolerance`.
    pub fn flatten(&self, tolerance: f32) -> Path {
        let mut cur_pt = None;
        let mut flattened = Path {
            ops: Vec::new(),
            winding: Winding::NonZero,
        };
        for op in &self.ops {
            match *op {
                PathOp::MoveTo(pt) | PathOp::LineTo(pt) => {
                    cur_pt = Some(pt);
                    flattened.ops.push(op.clone())
                }
                PathOp::Close => {
                    cur_pt = None;
                    flattened.ops.push(op.clone())
                }
                PathOp::QuadTo(cpt, pt) => {
                    let start = cur_pt.unwrap_or(cpt);
                    let c = QuadraticBezierSegment {
                        from: start,
                        ctrl: cpt,
                        to: pt,
                    };
                    for l in c.flattened(tolerance) {
                        flattened.ops.push(PathOp::LineTo(l));
                    }
                    cur_pt = Some(pt);
                }
                PathOp::CubicTo(cpt1, cpt2, pt) => {
                    let start = cur_pt.unwrap_or(cpt1);
                    let c = CubicBezierSegment {
                        from: start,
                        ctrl1: cpt1,
                        ctrl2: cpt2,
                        to: pt,
                    };
                    for l in c.flattened(tolerance) {
                        flattened.ops.push(PathOp::LineTo(l));
                    }
                    cur_pt = Some(pt);
                }
            }
        }
        flattened
    }

    /// Returns true if the point `x`, `y` is within the filled
    /// area of of `self`. The path will be flattened using `tolerance`.
    /// The point is considered contained if it's on the path.
    // this function likely has bugs
    pub fn contains_point(&self, tolerance: f32, x: f32, y: f32) -> bool {
        //XXX Instead of making a new path we should just use flattening callbacks
        let flat_path = self.flatten(tolerance);
        struct WindState {
            first_point: Option<Point>,
            current_point: Option<Point>,
            count: i32,
            on_edge: bool,

            x: f32,
            y: f32,
        }

        impl WindState {
            fn close(&mut self) {
                if let (Some(first_point), Some(current_point)) =
                    (self.first_point, self.current_point)
                {
                    self.add_edge(current_point, first_point);
                }
                self.first_point = None;
            }

            // to determine containment we just need to count crossing of ray from (x, y) going to infinity
            fn add_edge(&mut self, p1: Point, p2: Point) {
                let (x1, y1) = (p1.x, p1.y);
                let (x2, y2) = (p2.x, p2.y);

                let dir = if y1 < y2 { -1 } else { 1 };

                // entirely to the right
                if x1 > self.x && x2 > self.x {
                    return;
                }

                // entirely above
                if y1 > self.y && y2 > self.y {
                    return;
                }

                // entirely below
                if y1 < self.y && y2 < self.y {
                    return;
                }

                // entirely to the left
                if x1 < self.x && x2 < self.x {
                    if y1 > self.y && y2 < self.y {
                        self.count += 1;
                        return;
                    }
                    if y2 > self.y && y1 < self.y {
                        self.count -= 1;
                        return;
                    }
                }

                let dx = x2 - x1;
                let dy = y2 - y1;

                // cross product/perp dot product lets us know which side of the line we're on
                let cross = dx * (self.y - y1) - dy * (self.x - x1);

                if cross == 0. {
                    self.on_edge = true;
                } else if (cross > 0. && dir > 0) || (cross < 0. && dir < 0) {
                    self.count += dir;
                }
            }
        }

        let mut ws = WindState {
            count: 0,
            first_point: None,
            current_point: None,
            x,
            y,
            on_edge: false,
        };

        for op in &flat_path.ops {
            match *op {
                PathOp::MoveTo(pt) => {
                    ws.close();
                    ws.current_point = Some(pt);
                    ws.first_point = Some(pt);
                }
                PathOp::LineTo(pt) => {
                    if let Some(current_point) = ws.current_point {
                        ws.add_edge(current_point, pt);
                    } else {
                        ws.first_point = Some(pt);
                    }
                    ws.current_point = Some(pt);
                }
                PathOp::QuadTo(..) | PathOp::CubicTo(..) => panic!(),
                PathOp::Close => ws.close(),
            }
        }
        // make sure the path is closed
        ws.close();

        let inside = match self.winding {
            Winding::EvenOdd => ws.count & 1 != 0,
            Winding::NonZero => ws.count != 0,
        };
        inside || ws.on_edge
    }

    pub fn transform(self, transform: &Transform) -> Path {
        let Path { ops, winding } = self;
        let ops = ops.into_iter().map(|op| op.transform(transform)).collect();
        Path { ops, winding }
    }
}

/// A helper struct used for constructing a `Path`.
pub struct PathBuilder {
    path: Path,
}

impl From<Path> for PathBuilder {
    fn from(path: Path) -> Self {
        PathBuilder { path }
    }
}

impl PathBuilder {
    pub fn new() -> PathBuilder {
        PathBuilder {
            path: Path {
                ops: Vec::new(),
                winding: Winding::NonZero,
            },
        }
    }

    /// Moves the current point to `x`, `y`
    pub fn move_to(&mut self, x: f32, y: f32) {
        self.path.ops.push(PathOp::MoveTo(Point::new(x, y)))
    }

    /// Adds a line segment from the current point to `x`, `y`
    pub fn line_to(&mut self, x: f32, y: f32) {
        self.path.ops.push(PathOp::LineTo(Point::new(x, y)))
    }

    /// Adds a quadratic bezier from the current point to `x`, `y`,
    /// using a control point of `cx`, `cy`
    pub fn quad_to(&mut self, cx: f32, cy: f32, x: f32, y: f32) {
        self.path
            .ops
            .push(PathOp::QuadTo(Point::new(cx, cy), Point::new(x, y)))
    }

    /// Adds a rect to the path
    pub fn rect(&mut self, x: f32, y: f32, width: f32, height: f32) {
        self.move_to(x, y);
        self.line_to(x + width, y);
        self.line_to(x + width, y + height);
        self.line_to(x, y + height);
        self.close();
    }

    /// Adds a cubic bezier from the current point to `x`, `y`,
    /// using control points `cx1`, `cy1` and `cx2`, `cy2`
    pub fn cubic_to(&mut self, cx1: f32, cy1: f32, cx2: f32, cy2: f32, x: f32, y: f32) {
        self.path.ops.push(PathOp::CubicTo(
            Point::new(cx1, cy1),
            Point::new(cx2, cy2),
            Point::new(x, y),
        ))
    }

    /// Closes the current subpath
    pub fn close(&mut self) {
        self.path.ops.push(PathOp::Close)
    }

    /// Adds an arc approximated by quadratic beziers with center `x`, `y`
    /// and radius `r` starting at `start_angle` and sweeping by `sweep_angle`.
    /// For a positive `sweep_angle` the sweep is done clockwise, for a negative
    /// `sweep_angle` the sweep is done counterclockwise.
    pub fn arc(&mut self, x: f32, y: f32, r: f32, start_angle: f32, sweep_angle: f32) {
        //XXX: handle the current point being the wrong spot
        let a: Arc<f32> = Arc {
            center: Point::new(x, y),
            radii: Vector::new(r, r),
            start_angle: Angle::radians(start_angle),
            sweep_angle: Angle::radians(sweep_angle),
            x_rotation: Angle::zero(),
        };
        let start = a.from();
        self.line_to(start.x, start.y);
        a.for_each_quadratic_bezier(&mut |q| {
            self.quad_to(q.ctrl.x, q.ctrl.y, q.to.x, q.to.y);
        });
    }

    /// Completes the current path
    pub fn finish(self) -> Path {
        self.path
    }
}

use crate::path_builder::*;

use crate::Point;

use lyon_geom::LineSegment;

#[derive(Clone, Copy)]
struct DashState {
    index: usize,          // index into the dash array
    on: bool,              // whether the dash is on or off
    remaining_length: f32, // how much of the dash remains
}

pub fn dash_path(path: &Path, dash_array: &[f32], mut dash_offset: f32) -> Path {
    let mut dashed = PathBuilder::new();

    let mut cur_pt = None;
    let mut start_point = None;

    let mut total_dash_length = 0.;
    for dash in dash_array {
        total_dash_length += *dash;
    }
    if dash_array.len() % 2 == 1 {
        // if the number of items in the dash_array is odd then we need it takes two periods
        // to return to the beginning.
        total_dash_length *= 2.;
    }

    // The dash length must be more than zero.
    if !(total_dash_length > 0.) {
        return dashed.finish();
    }

    // Handle large positive and negative offsets so that we don't loop for a high number of
    // iterations below in extreme cases
    dash_offset = dash_offset % total_dash_length;
    if dash_offset < 0. {
        dash_offset += total_dash_length;
    }

    // To handle closed paths we need a bunch of extra state so that we properly
    // join the first segment. Unfortunately, this makes the code sort of hairy.
    // We need to store all of the points in the initial segment so that we can
    // join the end of the path with it.
    let mut is_first_segment = true;
    let mut first_dash = true;
    let mut initial_segment: Vec<Point> = Vec::new();

    let mut state = DashState {
        on: true,
        remaining_length: dash_array[0],
        index: 0,
    };

    // adjust our position in the dash array by the dash offset
    while dash_offset > state.remaining_length {
        dash_offset -= state.remaining_length;
        state.index += 1;
        state.remaining_length = dash_array[state.index % dash_array.len()];
        state.on = !state.on;
    }
    state.remaining_length -= dash_offset;

    // Save a copy of the initial state so that we can restore it for each subpath
    let initial = state;
    for op in &path.ops {
        match *op {
            PathOp::MoveTo(pt) => {
                cur_pt = Some(pt);
                start_point = Some(pt);
                dashed.move_to(pt.x, pt.y);

                // flush the previous initial segment
                if initial_segment.len() > 0 {
                    dashed.move_to(initial_segment[0].x, initial_segment[0].y);
                    for i in 1..initial_segment.len() {
                        dashed.line_to(initial_segment[i].x, initial_segment[i].y);
                    }
                }
                is_first_segment = true;
                initial_segment = Vec::new();
                first_dash = true;

                // reset the dash state
                state = initial;
            }
            PathOp::LineTo(pt) => {
                if let Some(cur_pt) = cur_pt {
                    let mut start = cur_pt;
                    let line = LineSegment {
                        from: start,
                        to: pt,
                    };
                    let mut len = line.length();
                    let lv = line.to_vector().normalize();
                    while len > state.remaining_length {
                        let seg = start + lv * state.remaining_length;
                        if state.on {
                            if is_first_segment {
                                initial_segment.push(start);
                                initial_segment.push(seg);
                            } else {
                                dashed.line_to(seg.x, seg.y);
                            }
                        } else {
                            first_dash = false;
                            dashed.move_to(seg.x, seg.y);
                        }
                        is_first_segment = false;
                        state.on = !state.on;
                        state.index += 1;
                        len -= state.remaining_length;
                        state.remaining_length = dash_array[state.index % dash_array.len()];
                        start = seg;
                    }
                    if state.on {
                        if is_first_segment {
                            initial_segment.push(start);
                            initial_segment.push(pt);
                        } else {
                            dashed.line_to(pt.x, pt.y);
                        }
                    } else {
                        first_dash = false;
                        dashed.move_to(pt.x, pt.y);
                    }
                    state.remaining_length -= len;
                }
                cur_pt = Some(pt);
            }
            PathOp::Close => {
                if let (Some(current), Some(start_point)) = (cur_pt, start_point) {
                    let mut start = current;
                    let line = LineSegment {
                        from: start,
                        to: start_point,
                    };
                    let mut len = line.length();
                    let lv = line.to_vector().normalize();

                    while len > state.remaining_length {
                        let seg = start + lv * state.remaining_length;
                        if state.on {
                            if is_first_segment {
                                initial_segment.push(start);
                                initial_segment.push(seg);
                            } else {
                                dashed.line_to(seg.x, seg.y);
                            }
                        } else {
                            first_dash = false;
                            dashed.move_to(seg.x, seg.y);
                        }
                        state.on = !state.on;
                        state.index += 1;
                        len -= state.remaining_length;
                        state.remaining_length = dash_array[state.index % dash_array.len()];
                        start = seg;
                    }

                    if state.on {
                        if first_dash {
                            // If we're still on the first dash we can just close
                            dashed.close();
                        } else {
                            if initial_segment.len() > 0 {
                                // If have an initial segment we'll need to connect with it
                                for pt in initial_segment {
                                    dashed.line_to(pt.x, pt.y);
                                }
                            } else {
                                dashed.line_to(start_point.x, start_point.y);
                            }
                        }
                    } else {
                        if initial_segment.len() > 0 {
                            dashed.move_to(initial_segment[0].x, initial_segment[0].y);
                            for i in 1..initial_segment.len() {
                                dashed.line_to(initial_segment[i].x, initial_segment[i].y);
                            }
                        }
                    }
                    initial_segment = Vec::new();
                    cur_pt = Some(start_point);

                    // reset the dash state
                    state = initial;
                } else {
                    cur_pt = None;
                }
            }
            PathOp::QuadTo(..) => panic!("Only flat paths handled"),
            PathOp::CubicTo(..) => panic!("Only flat paths handled"),
        }
    }

    // We still have an initial segment that we need to emit
    if !initial_segment.is_empty() {
        dashed.move_to(initial_segment[0].x, initial_segment[0].y);
        for i in 1..initial_segment.len() {
            dashed.line_to(initial_segment[i].x, initial_segment[i].y);
        }
    }
    dashed.finish()
}

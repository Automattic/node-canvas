/* Copyright 2013 Jeff Muizelaar
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file.
 *
 * Portions Copyright 2006 The Android Open Source Project
 *
 * Use of that source code is governed by a BSD-style license that can be
 * found in the LICENSE.skia file.
 */

use typed_arena::Arena;

use crate::blitter::RasterBlitter;
use crate::geom::intrect;
use crate::path_builder::Winding;
use crate::{IntRect, Point};

use std::ptr::NonNull;

// One reason to have separate Edge/ActiveEdge is reduce the
// memory usage of inactive edges. On the other hand
// managing the lifetime of ActiveEdges is a lot
// trickier than Edges. Edges can stay alive for the entire
// rasterization. ActiveEdges will come and go in a much
// less predictable order. On the other hand having the
// ActiveEdges close together in memory would help
// avoid cache misses. If we did switch to having separate
// active edges it might be wise to store the active edges
// in an array instead of as a linked list. This will work
// well for the bubble sorting, but will cause more problems
// for insertion.

struct Edge {
    //XXX: it is probably worth renaming this to top and bottom
    x1: Dot2,
    y1: Dot2,
    x2: Dot2,
    y2: Dot2,
    control_x: Dot2,
    control_y: Dot2,
}

// Fixed point representation:
// We use 30.2 for the end points and 16.16 for the intermediate
// results. I believe this essentially limits us to a 16.16 space.
//
// Prior Work:
// - Cairo used to be 16.16 but switched to 24.8. Cairo converts paths
//   early to this fixed representation
// - Fitz uses different precision depending on the AA settings
//   and uses the following Bresenham style adjustment in its step function
//   to avoid having to worry about intermediate precision
//       edge->x += edge->xmove;
//       edge->e += edge->adj_up;
//       if (edge->e > 0) {
//           edge->x += edge->xdir;
//           edge->e -= edge->adj_down;
//       }

/// 16.16 fixed point representation.
type Dot16 = i32;
/// 30.2 fixed point representation.
type Dot2 = i32;
/// 26.6 fixed point representation.
type Dot6 = i32;
/// A "sliding fixed point" representation 16.16 >> shift.
type ShiftedDot16 = i32;

fn div_fixed16_fixed16(a: Dot16, b: Dot16) -> Dot16 {
    (((a as i64) << 16) / (b as i64)) as i32
}

#[inline]
fn dot2_to_dot16(val: Dot2) -> Dot16 {
    val << (16 - SAMPLE_SHIFT)
}

#[inline]
fn dot16_to_dot2(val: Dot2) -> Dot16 {
    val >> (16 - SAMPLE_SHIFT)
}

#[inline]
fn dot2_to_int(val: Dot2) -> i32 {
    val >> SAMPLE_SHIFT
}

#[inline]
fn int_to_dot2(val: i32) -> Dot2 {
    val << SAMPLE_SHIFT
}

#[inline]
fn f32_to_dot2(val: f32) -> Dot2 {
    (val * SAMPLE_SIZE) as i32
}

#[inline]
fn dot2_to_dot6(val: Dot2) -> Dot6 {
    val << 4
}

// it is possible to fit this into 64 bytes on x86-64
// with the following layout:
//
// 4 x2,y2
// 8 next
// 6*4 slope_x,fullx,next_x,next_y, old_x,old_y
// 4*4 dx,ddx,dy,ddy
// 2 cury
// 1 count
// 1 shift
//
// some example counts 5704 curves, 1720 lines 7422 edges
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct ActiveEdge {
    x2: Dot2,
    y2: Dot2,
    next: Option<NonNull<ActiveEdge>>,
    slope_x: Dot16,
    fullx: Dot16,
    next_x: Dot16,
    next_y: Dot16,

    dx: Dot16,
    ddx: ShiftedDot16,
    dy: Dot16,
    ddy: ShiftedDot16,

    old_x: Dot16,
    old_y: Dot16,

    // Shift is used to "scale" how fast we move along the quadratic curve.
    // The key is that we scale dx and dy by the same amount so it doesn't need to have a physical unit
    // as long as it doesn't overshoot.
    // shift isdiv_fixed16_fixed16 probably also needed to balance number of bits that we need and make sure we don't
    // overflow the 32 bits we have.
    // It looks like some of quantities are stored in a "sliding fixed point" representation where the
    // point depends on the shift.
    shift: i32,
    // we need to use count so that we make sure that we always line the last point up
    // exactly. i.e. we don't have a great way to know when we're at the end implicitly.
    count: i32,
    winding: i8, // the direction of the edge
}

impl ActiveEdge {
    fn new() -> ActiveEdge {
        ActiveEdge {
            x2: 0,
            y2: 0,
            next: None,
            slope_x: 0,
            fullx: 0,
            next_x: 0,
            next_y: 0,
            dx: 0,
            ddx: 0,
            dy: 0,
            ddy: 0,
            old_x: 0,
            old_y: 0,
            shift: 0,
            count: 0,
            winding: 0,
        }
    }

    // we want this to inline into step_edges() to
    // avoid the call overhead
    fn step(&mut self, cury: Dot2) {
        // if we have a shift that means we have a curve
        if self.shift != 0 {
            if cury >= dot16_to_dot2(self.next_y) {
                self.old_y = self.next_y;
                self.old_x = self.next_x;
                self.fullx = self.next_x;
                // increment until we have a next_y that's greater
                while self.count > 0 && cury >= dot16_to_dot2(self.next_y) {
                    self.next_x += self.dx >> self.shift;
                    self.dx += self.ddx;
                    self.next_y += self.dy >> self.shift;
                    self.dy += self.ddy;
                    self.count -= 1;
                }
                if self.count == 0 {
                    // for the last line sgement we can
                    // just set next_y,x to the end point
                    self.next_y = dot2_to_dot16(self.y2);
                    self.next_x = dot2_to_dot16(self.x2);
                }
                // update slope if we're going to be using it
                // we want to avoid dividing by 0 which can happen if we exited the loop above early
                if (cury + 1) < self.y2 {
                    self.slope_x =
                        div_fixed16_fixed16(self.next_x - self.old_x, self.next_y - self.old_y)
                            >> 2;
                }
            }
            self.fullx += self.slope_x;
        } else {
            // XXX: look into bresenham to control error here
            self.fullx += self.slope_x;
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Rasterizer {
    edge_starts: Vec<Option<NonNull<ActiveEdge>>>,
    width: i32,
    height: i32,
    cur_y: Dot2,

    // we use this rect to track the bounds of the added edges
    bounds_top: i32,
    bounds_bottom: i32,
    bounds_left: i32,
    bounds_right: i32,

    active_edges: Option<NonNull<ActiveEdge>>,

    edge_arena: Arena<ActiveEdge>,
}

impl Rasterizer {
    pub fn new(width: i32, height: i32) -> Rasterizer {
        let mut edge_starts = Vec::new();
        for _ in 0..int_to_dot2(height) {
            edge_starts.push(None);
        }
        Rasterizer {
            width: int_to_dot2(width),
            height: int_to_dot2(height),
            bounds_right: 0,
            bounds_left: width,
            bounds_top: height,
            bounds_bottom: 0,
            cur_y: 0,
            edge_starts,
            edge_arena: Arena::new(),
            active_edges: None,
        }
    }
}

// A cheap version of the "Alpha max plus beta min" algorithm (⍺=1, β=0.5)
fn cheap_distance(mut dx: Dot6, mut dy: Dot6) -> Dot6 {
    dx = dx.abs();
    dy = dy.abs();
    // return max + min/2
    if dx > dy {
        dx + (dy >> 1)
    } else {
        dy + (dx >> 1)
    }
}

fn diff_to_shift(dx: Dot6, dy: Dot6) -> i32 {
    // cheap calc of distance from center of p0-p2 to the center of the curve
    let mut dist = cheap_distance(dx, dy);

    // shift down dist (it is currently in dot6)
    // down by 5 should give us 1/2 pixel accuracy (assuming our dist is accurate...)
    // this is chosen by heuristic: make it as big as possible (to minimize segments)
    // ... but small enough so that our curves still look smooth
    dist = (dist + (1 << 4)) >> 5;

    // each subdivision (shift value) cuts this dist (error) by 1/4
    (32 - ((dist as u32).leading_zeros()) as i32) >> 1
}

// this metric is taken from skia
fn compute_curve_steps(e: &Edge) -> i32 {
    let dx = e.control_x * 2 - e.x1 - e.x2;
    let dy = e.control_y * 2 - e.y1 - e.y2;
    let shift = diff_to_shift(dot2_to_dot6(dx), dot2_to_dot6(dy));
    assert!(shift >= 0);

    shift
}

const SAMPLE_SIZE: f32 = (1 << SAMPLE_SHIFT) as f32;
pub const SAMPLE_SHIFT: i32 = 2;

/*  We store 1<<shift in a (signed) byte, so its maximum value is 1<<6 == 64.
    Note that this limits the number of lines we use to approximate a curve.
    If we need to increase this, we need to store fCurveCount in something
    larger than int8_t.
*/
const MAX_COEFF_SHIFT: i32 = 6;

// An example number of edges is 7422 but
// can go as high as edge count: 374640
// with curve count: 67680
impl Rasterizer {
    // Overflow:
    // cairo just does _cairo_fixed_from_double (x) which ends up having some
    // weird behaviour around overflow because of the double to fixed conversion trick that it does.

    // Fitz clips edges to the bounding box
    #[allow(non_snake_case)]
    pub fn add_edge(&mut self, mut start: Point, mut end: Point, curve: bool, control: Point) {
        if curve {
            //println!("add_edge {}, {} - {}, {} - {}, {}", start.x, start.y, control.x, control.y, end.x, end.y);
        } else {
            //println!("add_edge {}, {} - {}, {}", start.x, start.y, end.x, end.y);
        }
        // order the points from top to bottom

        // how do we deal with edges to the right and left of the canvas?
        let e = self.edge_arena.alloc(ActiveEdge::new());
        if end.y < start.y {
            std::mem::swap(&mut start, &mut end);
            e.winding = -1;
        } else {
            e.winding = 1;
        }
        let edge = Edge {
            x1: f32_to_dot2(start.x),
            y1: f32_to_dot2(start.y),
            control_x: f32_to_dot2(control.x),
            control_y: f32_to_dot2(control.y),
            x2: f32_to_dot2(end.x),
            y2: f32_to_dot2(end.y),
        };
        e.x2 = edge.x2;
        e.y2 = edge.y2;

        e.next = None;
        //e.curx = e.edge.x1;
        let mut cury = edge.y1;
        e.fullx = dot2_to_dot16(edge.x1);

        // if the edge is completely above or completely below we can drop it
        if edge.y2 < 0 || edge.y1 >= self.height {
            return;
        }

        // drop horizontal edges
        if cury >= e.y2 {
            return;
        }

        self.bounds_top = self.bounds_top.min(dot2_to_int(edge.y1));
        self.bounds_bottom = self.bounds_bottom.max(dot2_to_int(edge.y2 + 3));

        self.bounds_left = self.bounds_left.min(dot2_to_int(edge.x1));
        self.bounds_left = self.bounds_left.min(dot2_to_int(edge.x2));

        self.bounds_right = self.bounds_right.max(dot2_to_int(edge.x1 + 3));
        self.bounds_right = self.bounds_right.max(dot2_to_int(edge.x2 + 3));

        if curve {
            self.bounds_left = self.bounds_left.min(dot2_to_int(edge.control_x));
            self.bounds_right = self.bounds_right.max(dot2_to_int(edge.control_x + 3));

            // Based on Skia
            // we'll iterate t from 0..1 (0-256)
            // range of A is 4 times coordinate-range
            // we can get more accuracy here by using the input points instead of the rounded versions
            // A is derived from `dot2_to_dot16(2 * (from - 2 * ctrl + to))`, it is the second derivative of the
            // quadratic bézier.
            let mut A =
                (edge.x1 - edge.control_x - edge.control_x + edge.x2) << (15 - SAMPLE_SHIFT);
            let mut B = edge.control_x - edge.x1; // The derivative at the start of the curve is 2 * (ctrl - from).
                                                  //let mut C = edge.x1;
            let mut shift = compute_curve_steps(&edge);

            if shift == 0 {
                shift = 1;
            } else if shift > MAX_COEFF_SHIFT {
                shift = MAX_COEFF_SHIFT;
            }
            e.shift = shift;
            e.count = 1 << shift;
            e.dx = 2 * (A >> shift) + 2 * B * (1 << (16 - SAMPLE_SHIFT));
            e.ddx = 2 * (A >> (shift - 1));

            A = (edge.y1 - edge.control_y - edge.control_y + edge.y2) << (15 - SAMPLE_SHIFT);
            B = edge.control_y - edge.y1;
            //C = edge.y1;
            e.dy = 2 * (A >> shift) + 2 * B * (1 << (16 - SAMPLE_SHIFT));
            e.ddy = 2 * (A >> (shift - 1));

            // compute the first next_x,y
            e.count -= 1;
            e.next_x = (e.fullx) + (e.dx >> e.shift);
            e.next_y = (cury * (1 << (16 - SAMPLE_SHIFT))) + (e.dy >> e.shift);
            e.dx += e.ddx;
            e.dy += e.ddy;

            // skia does this part in UpdateQuad. unfortunately we duplicate it
            while e.count > 0 && cury >= dot16_to_dot2(e.next_y) {
                e.next_x += e.dx >> shift;
                e.dx += e.ddx;
                e.next_y += e.dy >> shift;
                e.dy += e.ddy;
                e.count -= 1;
            }
            if e.count == 0 {
                e.next_y = dot2_to_dot16(edge.y2);
                e.next_x = dot2_to_dot16(edge.x2);
            }
            e.slope_x = (e.next_x - (e.fullx)) / dot16_to_dot2(e.next_y - dot2_to_dot16(cury));
        } else {
            e.shift = 0;
            e.slope_x = (edge.x2 - edge.x1) * (1 << (16 - SAMPLE_SHIFT)) / (edge.y2 - edge.y1);
        }

        if cury < 0 {
            // XXX: we could compute an intersection with the top and bottom so we don't need to step them into view
            // for curves we can just step them into place.
            while cury < 0 {
                e.step(cury);
                cury += 1;
            }

            // cury was adjusted so check again for horizontal edges
            if cury >= e.y2 {
                return;
            }
        }

        // add to the beginning of the edge start list
        // if edges are added from left to right
        // they'll be in this list from right to left
        // this works out later during insertion
        e.next = self.edge_starts[cury as usize];
        self.edge_starts[cury as usize] = Some(NonNull::from(e));
    }

    fn step_edges(&mut self) {
        let mut prev_ptr = &mut self.active_edges as *mut _;
        let mut edge = self.active_edges;
        let cury = self.cur_y; // avoid any aliasing problems
        while let Some(mut e_ptr) = edge {
            let e = unsafe { e_ptr.as_mut() };
            e.step(cury);
            // avoid aliasing between edge->next and prev_ptr so that we can reuse next
            let next = e.next;
            // remove any finished edges
            if (cury + 1) >= e.y2 {
                // remove from active list
                unsafe { *prev_ptr = next };
            } else {
                prev_ptr = &mut e.next;
            }
            edge = next;
        }
    }
    /*
        int comparisons;
        static inline void dump_edges(ActiveEdge *e)
        {
        while (e) {
        printf("%d ", e.fullx);
        e = e.next;
        }
        printf("\n");
        }
    */
    // Insertion sort the new edges into the active list
    // The new edges could be showing up at any x coordinate
    // but existing active edges will be sorted.
    //
    // Merge in the new edges. Since both lists are sorted we can do
    // this in a single pass.
    // Note: we could do just O(1) append the list of new active edges
    // to the existing active edge list, but then we'd have to sort
    // the entire resulting list
    fn insert_starting_edges(&mut self) {
        let mut new_edges: Option<NonNull<ActiveEdge>> = None;
        let mut edge = self.edge_starts[self.cur_y as usize];
        // insertion sort all of the new edges
        while let Some(mut e_ptr) = edge {
            let e = unsafe { e_ptr.as_mut() };
            let mut prev_ptr = &mut new_edges as *mut _;
            let mut new = new_edges;
            while let Some(mut new_ptr) = new {
                let a = unsafe { new_ptr.as_mut() };
                if e.fullx <= a.fullx {
                    break;
                }
                // comparisons++;
                prev_ptr = &mut a.next;
                new = a.next;
            }
            edge = e.next;
            e.next = new;
            unsafe { *prev_ptr = Some(e_ptr) };
        }

        // merge the sorted new_edges into active_edges
        let mut prev_ptr = &mut self.active_edges as *mut _;
        let mut active = self.active_edges;
        let mut edge = new_edges;
        while let Some(mut e_ptr) = edge {
            let e = unsafe { e_ptr.as_mut() };
            while let Some(mut a_ptr) = active {
                let a = unsafe { a_ptr.as_mut() };
                if e.fullx <= a.fullx {
                    break;
                }

                // comparisons++;
                prev_ptr = &mut a.next;
                active = a.next;
            }
            edge = e.next;
            e.next = active;
            let next_prev_ptr = &mut e.next as *mut _;
            unsafe { *prev_ptr = Some(e_ptr) };
            prev_ptr = next_prev_ptr;
        }
    }

    // Skia does stepping and scanning of edges in a single
    // pass over the edge list.
    fn scan_edges(&mut self, blitter: &mut dyn RasterBlitter, winding_mode: Winding) {
        let mut edge = self.active_edges;
        let mut winding = 0;

        // handle edges that begin to the left of the bitmap
        while let Some(mut e_ptr) = edge {
            let e = unsafe { e_ptr.as_mut() };
            if e.fullx >= 0 {
                break;
            }
            winding += e.winding as i32;
            edge = e.next;
        }

        let mut prevx = 0;
        while let Some(mut e_ptr) = edge {
            let e = unsafe { e_ptr.as_mut() };

            let inside = match winding_mode {
                Winding::EvenOdd => winding & 1 != 0,
                Winding::NonZero => winding != 0,
            };

            if inside {
                blitter.blit_span(
                    self.cur_y,
                    dot16_to_dot2(prevx + (1 << (15 - SAMPLE_SHIFT))),
                    dot16_to_dot2(e.fullx + (1 << (15 - SAMPLE_SHIFT))),
                );
            }

            if dot16_to_dot2(e.fullx) >= self.width {
                break;
            }
            winding += e.winding as i32;
            prevx = e.fullx;
            edge = e.next;
        }

        // we don't need to worry about any edges beyond width
    }

    // You may have heard that one should never use a bubble sort.
    // However in our situation a bubble sort is actually a good choice.
    // The input list will be mostly sorted except for a couple of lines
    // that have need to be swapped. Further it is common that our edges are
    // already sorted and bubble sort lets us avoid doing any memory writes.

    // Some statistics from using a bubble sort on an
    // example scene. You can see that bubble sort does
    // noticeably better than O (n lg n).
    // summary(edges*bubble_sort_iterations)
    //   Min. 1st Qu.  Median    Mean 3rd Qu.    Max.
    //    0.0     9.0    69.0   131.5   206.0  1278.0
    // summary(edges*log2(edges))
    //   Min. 1st Qu.  Median    Mean 3rd Qu.    Max.    NA's
    //   0.00   28.53  347.10  427.60  787.20 1286.00    2.00
    fn sort_edges(&mut self) {
        if self.active_edges.is_none() {
            return;
        }

        let mut swapped;
        loop {
            swapped = false;
            let mut edge = self.active_edges.unwrap();
            let mut next_edge = unsafe { edge.as_mut() }.next;
            let mut prev = &mut self.active_edges as *mut _;
            while let Some(mut next_ptr) = next_edge {
                let next = unsafe { next_ptr.as_mut() };
                if unsafe { edge.as_mut() }.fullx > next.fullx {
                    // swap edge and next
                    unsafe { edge.as_mut() }.next = next.next;
                    next.next = Some(edge);
                    unsafe { (*prev) = Some(next_ptr) };
                    swapped = true;
                }
                prev = (&mut unsafe { edge.as_mut() }.next) as *mut _;
                edge = next_ptr;
                next_edge = unsafe { edge.as_mut() }.next;
            }
            if !swapped {
                break;
            }
        }
    }

    pub fn rasterize(&mut self, blitter: &mut dyn RasterBlitter, winding_mode: Winding) {
        let start = int_to_dot2(self.bounds_top).max(0);
        let end = int_to_dot2(self.bounds_bottom).min(self.height);

        self.cur_y = start;
        while self.cur_y < end {
            // we do 4x4 super-sampling so we need
            // to scan 4 times before painting a line of pixels
            for _ in 0..4 {
                // insert the new edges into the sorted list
                self.insert_starting_edges();
                // scan over the edge list producing a list of spans
                self.scan_edges(blitter, winding_mode);
                // step all of the edges to the next scanline
                // dropping the ones that end
                self.step_edges();
                // sort the remaining edges
                self.sort_edges();
                self.cur_y += 1;
            }
        }
    }

    pub fn get_bounds(&self) -> IntRect {
        intrect(
            self.bounds_left.max(0),
            self.bounds_top.max(0),
            self.bounds_right.min(dot2_to_int(self.width)),
            self.bounds_bottom.min(dot2_to_int(self.height)),
        )
    }

    pub fn reset(&mut self) {
        if self.bounds_bottom < self.bounds_top {
            debug_assert_eq!(self.active_edges, None);
            for e in &mut self.edge_starts {
                debug_assert_eq!(*e, None);
            }
            debug_assert_eq!(self.bounds_bottom, 0);
            debug_assert_eq!(self.bounds_right, 0);
            debug_assert_eq!(self.bounds_top, dot2_to_int(self.height));
            debug_assert_eq!(self.bounds_left, dot2_to_int(self.width));
            // Currently we allocate an edge in the arena even if we don't
            // end up putting it in the edge_starts list. Avoiding that
            // would let us avoiding having to reinitialize the arena
            self.edge_arena = Arena::new();
            return;
        }
        let start = int_to_dot2(self.bounds_top).max(0) as usize;
        let end = int_to_dot2(self.bounds_bottom).min(self.height) as usize;
        self.active_edges = None;
        for e in &mut self.edge_starts[start..end] {
            *e = None;
        }
        self.edge_arena = Arena::new();
        self.bounds_bottom = 0;
        self.bounds_right = 0;
        self.bounds_top = dot2_to_int(self.height);
        self.bounds_left = dot2_to_int(self.width);
    }
}

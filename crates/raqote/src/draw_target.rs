use crate::rasterizer::Rasterizer;

use crate::blitter::*;
use sw_composite::*;

use crate::dash::*;
use crate::geom::*;
use crate::path_builder::*;

pub use crate::path_builder::Winding;
use lyon_geom::CubicBezierSegment;

#[cfg(feature = "text")]
mod fk {
    pub use font_kit::canvas::{Canvas, Format, RasterizationOptions};
    pub use font_kit::font::Font;
    pub use font_kit::hinting::HintingOptions;
    pub use pathfinder_geometry::transform2d::Transform2F;
    pub use pathfinder_geometry::vector::{vec2f, vec2i};
}

#[cfg(feature = "png")]
use std::fs::*;
#[cfg(feature = "png")]
use std::io::BufWriter;

use crate::stroke::*;
use crate::{IntPoint, IntRect, Point, Transform, Vector};

use euclid::vec2;

#[derive(Clone)]
pub struct Mask {
    pub width: i32,
    pub height: i32,
    pub data: Vec<u8>,
}

/// A premultiplied color. i.e. r,b,g <= a
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct SolidSource {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

impl SolidSource {
    pub fn to_u32(&self) -> u32 {
        let color = ((self.a as u32) << 24)
            | ((self.r as u32) << 16)
            | ((self.g as u32) << 8)
            | ((self.b as u32) << 0);
        color
    }

    pub fn from_unpremultiplied_argb(a: u8, r: u8, g: u8, b: u8) -> Self {
        SolidSource {
            a: a,
            r: muldiv255(a as u32, r as u32) as u8,
            g: muldiv255(a as u32, g as u32) as u8,
            b: muldiv255(a as u32, b as u32) as u8,
        }
    }
}

impl From<Color> for SolidSource {
    fn from(color: Color) -> Self {
        SolidSource::from_unpremultiplied_argb(color.a(), color.r(), color.g(), color.b())
    }
}

#[derive(PartialEq, Clone, Copy, Debug)]
pub enum BlendMode {
    Dst,
    Src,
    Clear,
    SrcOver,
    DstOver,
    SrcIn,
    DstIn,
    SrcOut,
    DstOut,
    SrcAtop,
    DstAtop,
    Xor,
    Add,

    Screen,
    Overlay,
    Darken,
    Lighten,
    ColorDodge,
    ColorBurn,
    HardLight,
    SoftLight,
    Difference,
    Exclusion,
    Multiply,
    Hue,
    Saturation,
    Color,
    Luminosity,
}

trait Blender {
    type Output;
    fn build<T: blend::Blend>() -> Self::Output;
}

struct BlendRow;

fn blend_row<T: blend::Blend>(src: &[u32], dst: &mut [u32]) {
    for (dst, src) in dst.iter_mut().zip(src) {
        *dst = T::blend(*src, *dst);
    }
}

impl Blender for BlendRow {
    type Output = fn(&[u32], &mut [u32]);
    fn build<T: blend::Blend>() -> Self::Output {
        blend_row::<T>
    }
}

struct BlendRowMask;

fn blend_row_mask<T: blend::Blend>(src: &[u32], mask: &[u8], dst: &mut [u32]) {
    for ((dst, src), mask) in dst.iter_mut().zip(src).zip(mask) {
        *dst = lerp(*dst, T::blend(*src, *dst), alpha_to_alpha256(*mask as u32));
    }
}

impl Blender for BlendRowMask {
    type Output = fn(&[u32], &[u8], &mut [u32]);
    fn build<T: blend::Blend>() -> Self::Output {
        blend_row_mask::<T>
    }
}

struct BlendRowMaskClip;

fn blend_row_mask_clip<T: blend::Blend>(src: &[u32], mask: &[u8], clip: &[u8], dst: &mut [u32]) {
    for (((dst, src), mask), clip) in dst.iter_mut().zip(src).zip(mask).zip(clip) {
        *dst = alpha_lerp(*dst, T::blend(*src, *dst), *mask as u32, *clip as u32);
    }
}

impl Blender for BlendRowMaskClip {
    type Output = fn(&[u32], &[u8], &[u8], &mut [u32]);
    fn build<T: blend::Blend>() -> Self::Output {
        blend_row_mask_clip::<T>
    }
}

fn build_blend_proc<T: Blender>(mode: BlendMode) -> T::Output {
    use sw_composite::blend::*;
    match mode {
        BlendMode::Dst => T::build::<Dst>(),
        BlendMode::Src => T::build::<Src>(),
        BlendMode::Clear => T::build::<Clear>(),
        BlendMode::SrcOver => T::build::<SrcOver>(),
        BlendMode::DstOver => T::build::<DstOver>(),
        BlendMode::SrcIn => T::build::<SrcIn>(),
        BlendMode::DstIn => T::build::<DstIn>(),
        BlendMode::SrcOut => T::build::<SrcOut>(),
        BlendMode::DstOut => T::build::<DstOut>(),
        BlendMode::SrcAtop => T::build::<SrcAtop>(),
        BlendMode::DstAtop => T::build::<DstAtop>(),
        BlendMode::Xor => T::build::<Xor>(),
        BlendMode::Add => T::build::<Add>(),
        BlendMode::Screen => T::build::<Screen>(),
        BlendMode::Overlay => T::build::<Overlay>(),
        BlendMode::Darken => T::build::<Darken>(),
        BlendMode::Lighten => T::build::<Lighten>(),
        BlendMode::ColorDodge => T::build::<ColorDodge>(),
        BlendMode::ColorBurn => T::build::<ColorBurn>(),
        BlendMode::HardLight => T::build::<HardLight>(),
        BlendMode::SoftLight => T::build::<SoftLight>(),
        BlendMode::Difference => T::build::<Difference>(),
        BlendMode::Exclusion => T::build::<Exclusion>(),
        BlendMode::Multiply => T::build::<Multiply>(),
        BlendMode::Hue => T::build::<Hue>(),
        BlendMode::Saturation => T::build::<Saturation>(),
        BlendMode::Color => T::build::<Color>(),
        BlendMode::Luminosity => T::build::<Luminosity>(),
    }
}

#[derive(Copy, Clone)]
pub enum ExtendMode {
    Pad,
    Repeat,
}

#[derive(Copy, Clone, PartialEq)]
pub enum FilterMode {
    Bilinear,
    Nearest,
}

/// LinearGradients have an implicit start point at 0,0 and an end point at 256,0. The transform
/// parameter can be used to adjust them to the desired location.
/// RadialGradients have an implicit center at 0,0 and a radius of 128.
/// The helper functions: `new_linear_gradient`, `new_radial_gradient` and `new_two_circle_radial_gradient`
/// allow the gradients to be constructed with easier to understand inputs.
/// The `transform` parameter maps user space to source space. This means that setting the same transform
/// on the draw target as the source will have the effect of canceling out.
///
/// These locations are an artifact of the blitter implementation and will probably change in the
/// future to become more ergonomic.
#[derive(Clone)]
pub enum Source<'a> {
    Solid(SolidSource),
    Image(Image<'a>, ExtendMode, FilterMode, Transform),
    RadialGradient(Gradient, Spread, Transform),
    TwoCircleRadialGradient(Gradient, Spread, Point, f32, Point, f32, Transform),
    LinearGradient(Gradient, Spread, Transform),
    SweepGradient(Gradient, Spread, f32, f32, Transform),
}

impl From<SolidSource> for Source<'_> {
    fn from(other: SolidSource) -> Self {
        Source::Solid(other)
    }
}

impl From<Color> for Source<'_> {
    fn from(color: Color) -> Self {
        Source::Solid(SolidSource::from(color))
    }
}

impl<'a> Source<'a> {
    /// Creates a new linear gradient source where the start point corresponds to the gradient
    /// stop at position = 0 and the end point corresponds to the gradient stop at position = 1.
    pub fn new_linear_gradient(
        gradient: Gradient,
        start: Point,
        end: Point,
        spread: Spread,
    ) -> Source<'a> {
        let gradient_vector = Vector::new(end.x - start.x, end.y - start.y);
        // Get length of desired gradient vector
        let length = gradient_vector.length();
        if length != 0. {
            let gradient_vector = gradient_vector.normalize();

            let sin = gradient_vector.y;
            let cos = gradient_vector.x;
            // Build up a rotation matrix from our vector
            let mat = Transform::new(cos, -sin, sin, cos, 0., 0.);

            // Adjust for the start point
            let mat = mat.pre_translate(vec2(-start.x, -start.y));

            // Scale gradient to desired length
            let mat = mat.then_scale(1. / length, 1. / length);
            Source::LinearGradient(gradient, spread, mat)
        } else {
            // use some degenerate matrix
            Source::LinearGradient(gradient, spread, Transform::scale(0., 0.))
        }
    }

    /// Creates a new radial gradient that is centered at the given point and has the given radius.
    pub fn new_radial_gradient(
        gradient: Gradient,
        center: Point,
        radius: f32,
        spread: Spread,
    ) -> Source<'a> {
        // Scale gradient to desired radius
        let scale = Transform::scale(radius, radius);
        // Transform gradient to center of gradient
        let translate = Transform::translation(center.x, center.y);
        // Compute final transform
        let transform = scale.then(&translate).inverse().unwrap();

        Source::RadialGradient(gradient, spread, transform)
    }

    /// Creates a new radial gradient that is centered at the given point and has the given radius.
    pub fn new_two_circle_radial_gradient(
        gradient: Gradient,
        center1: Point,
        radius1: f32,
        center2: Point,
        radius2: f32,
        spread: Spread,
    ) -> Source<'a> {
        let transform = Transform::identity();
        Source::TwoCircleRadialGradient(
            gradient, spread, center1, radius1, center2, radius2, transform,
        )
    }

    /// Creates a new sweep gradient that is centered at the given point with `start_angle` and `end_angle`.
    pub fn new_sweep_gradient(
        gradient: Gradient,
        center: Point,
        start_angle: f32,
        end_angle: f32,
        spread: Spread,
    ) -> Source<'a> {
        // Transform gradient to center of gradient
        let transform = Transform::translation(-center.x, -center.y);
        Source::SweepGradient(gradient, spread, start_angle, end_angle, transform)
    }
}

#[derive(PartialEq, Clone, Copy, Debug)]
pub enum AntialiasMode {
    None,
    Gray,
}

#[derive(PartialEq, Clone, Copy, Debug)]
pub struct DrawOptions {
    pub blend_mode: BlendMode,
    pub alpha: f32,
    pub antialias: AntialiasMode,
}

impl DrawOptions {
    pub fn new() -> Self {
        Default::default()
    }
}

impl Default for DrawOptions {
    fn default() -> Self {
        DrawOptions {
            blend_mode: BlendMode::SrcOver,
            alpha: 1.,
            antialias: AntialiasMode::Gray,
        }
    }
}

#[derive(Debug, Clone)]
struct Clip {
    rect: IntRect,
    mask: Option<Vec<u8>>,
}

#[derive(Debug, Clone)]
struct Layer {
    buf: Vec<u32>,
    opacity: f32,
    rect: IntRect,
    blend: BlendMode,
}

fn scaled_tolerance(x: f32, trans: &Transform) -> f32 {
    // The absolute value of the determinant is the area parallelogram
    // Take the sqrt of the area to losily convert to one dimension
    x / trans.determinant().abs().sqrt()
}

/// The main type used for drawing
#[derive(Debug, Clone)]
pub struct DrawTarget<Backing = Vec<u32>> {
    width: i32,
    height: i32,
    rasterizer: Rasterizer,
    current_point: Option<Point>,
    first_point: Option<Point>,
    buf: Backing,
    clip_stack: Vec<Clip>,
    layer_stack: Vec<Layer>,
    transform: Transform,
}

impl DrawTarget {
    pub fn new(width: i32, height: i32) -> DrawTarget {
        DrawTarget {
            width,
            height,
            current_point: None,
            first_point: None,
            rasterizer: Rasterizer::new(width, height),
            buf: vec![0; (width * height) as usize],
            clip_stack: Vec::new(),
            layer_stack: Vec::new(),
            transform: Transform::identity(),
        }
    }

    /// Use a previously used vector for the bitmap and extend it to the given size(if needed)
    pub fn from_vec(width: i32, height: i32, mut vec: Vec<u32>) -> DrawTarget {
        vec.resize((width * height) as usize, 0);
        DrawTarget {
            width,
            height,
            current_point: None,
            first_point: None,
            rasterizer: Rasterizer::new(width, height),
            buf: vec,
            clip_stack: Vec::new(),
            layer_stack: Vec::new(),
            transform: Transform::identity(),
        }
    }

    /// Take ownership of the buffer backing the DrawTarget
    pub fn into_vec(self) -> Vec<u32> {
        self.buf
    }
}

impl<Backing: AsRef<[u32]> + AsMut<[u32]>> DrawTarget<Backing> {
    /// Use an existing backing storage for the bitmap
    ///
    /// The backing store must be the correct size (width*height elements).
    pub fn from_backing(width: i32, height: i32, buf: Backing) -> Self {
        assert_eq!((width * height) as usize, buf.as_ref().len());
        DrawTarget {
            width,
            height,
            current_point: None,
            first_point: None,
            rasterizer: Rasterizer::new(width, height),
            buf,
            clip_stack: Vec::new(),
            layer_stack: Vec::new(),
            transform: Transform::identity(),
        }
    }

    pub fn width(&self) -> i32 {
        self.width
    }

    pub fn height(&self) -> i32 {
        self.height
    }

    /// sets a transform that will be applied to all drawing operations
    pub fn set_transform(&mut self, transform: &Transform) {
        self.transform = *transform;
    }

    /// gets the current transform
    pub fn get_transform(&self) -> &Transform {
        &self.transform
    }

    fn move_to(&mut self, pt: Point) {
        self.current_point = Some(pt);
        self.first_point = Some(pt);
    }

    fn line_to(&mut self, pt: Point) {
        if self.current_point.is_none() {
            self.current_point = Some(pt);
            self.first_point = Some(pt);
        }
        if let Some(current_point) = self.current_point {
            self.rasterizer
                .add_edge(current_point, pt, false, Point::new(0., 0.));
            self.current_point = Some(pt);
        }
    }

    fn quad_to(&mut self, cpt: Point, pt: Point) {
        if self.current_point.is_none() {
            self.current_point = Some(cpt);
            self.first_point = Some(cpt);
        }
        if let Some(current_point) = self.current_point {
            let curve = [current_point, cpt, pt];
            self.current_point = Some(curve[2]);
            self.add_quad(curve);
        }
    }

    fn add_quad(&mut self, mut curve: [Point; 3]) {
        let a = curve[0].y;
        let b = curve[1].y;
        let c = curve[2].y;
        if is_not_monotonic(a, b, c) {
            let mut t_value = 0.;
            if valid_unit_divide(a - b, a - b - b + c, &mut t_value) {
                let mut dst = [Point::new(0., 0.); 5];
                chop_quad_at(&curve, &mut dst, t_value);
                flatten_double_quad_extrema(&mut dst);
                self.rasterizer.add_edge(dst[0], dst[2], true, dst[1]);
                self.rasterizer.add_edge(dst[2], dst[4], true, dst[3]);
                return;
            }
            // if we get here, we need to force dst to be monotonic, even though
            // we couldn't compute a unit_divide value (probably underflow).
            let b = if (a - b).abs() < (b - c).abs() { a } else { c };
            curve[1].y = b;
        }
        self.rasterizer.add_edge(curve[0], curve[2], true, curve[1]);
    }

    fn cubic_to(&mut self, cpt1: Point, cpt2: Point, pt: Point) {
        if self.current_point.is_none() {
            self.current_point = Some(cpt1);
            self.first_point = Some(cpt1);
        }
        if let Some(current_point) = self.current_point {
            let c = CubicBezierSegment {
                from: current_point,
                ctrl1: cpt1,
                ctrl2: cpt2,
                to: pt,
            };
            c.for_each_quadratic_bezier(0.01, &mut |q| {
                let curve = [q.from, q.ctrl, q.to];
                self.add_quad(curve);
            });
            self.current_point = Some(pt);
        }
    }

    fn close(&mut self) {
        if let (Some(first_point), Some(current_point)) = (self.first_point, self.current_point) {
            self.rasterizer
                .add_edge(current_point, first_point, false, Point::new(0., 0.));
        }
        self.current_point = self.first_point;
    }

    fn apply_path(&mut self, path: &Path) {
        // we have no height so there can be no edges
        if self.height == 0 {
            return;
        }

        for op in &path.ops {
            match *op {
                PathOp::MoveTo(pt) => {
                    self.close();
                    self.move_to(self.transform.transform_point(pt));
                }
                PathOp::LineTo(pt) => self.line_to(self.transform.transform_point(pt)),
                PathOp::QuadTo(cpt, pt) => self.quad_to(
                    self.transform.transform_point(cpt),
                    self.transform.transform_point(pt),
                ),
                PathOp::CubicTo(cpt1, cpt2, pt) => self.cubic_to(
                    self.transform.transform_point(cpt1),
                    self.transform.transform_point(cpt2),
                    self.transform.transform_point(pt),
                ),
                PathOp::Close => self.close(),
            }
        }
        // make sure the path is closed
        self.close();
        // XXX: we'd like for this function to return the bounds of the path
    }

    pub fn push_clip_rect(&mut self, rect: IntRect) {
        // intersect with current clip
        let clip = match self.clip_stack.last() {
            Some(Clip {
                rect: current_clip,
                mask: _,
            }) => Clip {
                rect: current_clip.intersection_unchecked(&rect),
                mask: None,
            },
            _ => Clip {
                rect: rect,
                mask: None,
            },
        };
        self.clip_stack.push(clip);
    }

    pub fn pop_clip(&mut self) {
        self.clip_stack.pop();
    }

    pub fn push_clip(&mut self, path: &Path) {
        self.apply_path(path);

        // XXX: restrict to clipped area
        let mut blitter = MaskSuperBlitter::new(0, 0, self.width, self.height);
        self.rasterizer.rasterize(&mut blitter, path.winding);

        if let Some(last) = self.clip_stack.last() {
            // combine with previous mask
            if let Some(last_mask) = &last.mask {
                for i in 0..((self.width * self.height) as usize) {
                    blitter.buf[i] = muldiv255(blitter.buf[i] as u32, last_mask[i] as u32) as u8
                }
            }
        }

        let current_bounds = self.clip_bounds();
        //XXX: handle interleaving of clip rect/masks better
        self.clip_stack.push(Clip {
            rect: current_bounds,
            mask: Some(blitter.buf),
        });
        self.rasterizer.reset();
    }

    fn clip_bounds(&self) -> IntRect {
        self.clip_stack
            .last()
            .map(|c| c.rect)
            .unwrap_or(IntRect::new(
                euclid::Point2D::new(0, 0),
                euclid::Point2D::new(self.width, self.height),
            ))
    }

    /// Pushes a new layer as the drawing target. This is used for implementing
    /// group opacity effects.
    pub fn push_layer(&mut self, opacity: f32) {
        self.push_layer_with_blend(opacity, BlendMode::SrcOver)
    }

    /// Pushes a new layer as the drawing target. This is used for implementing
    /// group opacity or blend effects.
    pub fn push_layer_with_blend(&mut self, opacity: f32, blend: BlendMode) {
        let rect = self.clip_bounds();
        self.layer_stack.push(Layer {
            rect,
            buf: vec![0; (rect.size().width * rect.size().height) as usize],
            opacity,
            blend,
        });
    }

    /// Draws the most recently pushed layer to the drawing target with
    /// the pushed opacity applied.
    pub fn pop_layer(&mut self) {
        let layer = self.layer_stack.pop().unwrap();
        let opacity = (layer.opacity * 255. + 0.5) as u8;
        // Allocating an entire mask just for the opacity is needlessly bad.
        // We should be able to fix it once the blitters work better.
        let mask = vec![opacity; (self.width * self.height) as usize];
        let size = layer.rect.size();
        let ctm = self.transform;
        self.transform = Transform::identity();
        let image = Source::Image(
            Image {
                width: size.width,
                height: size.height,
                data: &layer.buf,
            },
            ExtendMode::Pad,
            FilterMode::Nearest,
            Transform::translation(-layer.rect.min.x as f32, -layer.rect.min.y as f32),
        );
        self.composite(
            &image,
            Some(&mask),
            intrect(0, 0, self.width, self.height),
            layer.rect,
            layer.blend,
            1.,
        );
        self.transform = ctm;
    }

    /// Draws an image at (x, y) with the size (width, height). This will rescale the image to the
    /// destination size.
    pub fn draw_image_with_size_at(
        &mut self,
        width: f32,
        height: f32,
        x: f32,
        y: f32,
        image: &Image,
        options: &DrawOptions,
    ) {
        let source = Source::Image(
            *image,
            ExtendMode::Pad,
            FilterMode::Bilinear,
            Transform::translation(-x, -y)
                .then_scale(image.width as f32 / width, image.height as f32 / height),
        );

        self.fill_rect(x, y, width, height, &source, options);
    }

    /// Draws an image at x, y
    pub fn draw_image_at(&mut self, x: f32, y: f32, image: &Image, options: &DrawOptions) {
        self.draw_image_with_size_at(
            image.width as f32,
            image.height as f32,
            x,
            y,
            image,
            options,
        );
    }

    /// Draws `src` through an untransformed `mask` positioned at `x`, `y` in device space
    pub fn mask(&mut self, src: &Source, x: i32, y: i32, mask: &Mask) {
        self.composite(
            src,
            Some(&mask.data),
            intrect(x, y, mask.width, mask.height),
            intrect(x, y, mask.width, mask.height),
            BlendMode::SrcOver,
            1.,
        );
    }

    /// Strokes `path` with `style` and fills the result with `src`
    pub fn stroke(
        &mut self,
        path: &Path,
        src: &Source,
        style: &StrokeStyle,
        options: &DrawOptions,
    ) {
        let tolerance = 0.1;

        // Since we're flattening in userspace, we need to compensate for the transform otherwise
        // we'll flatten too much or not enough depending on the scale. We approximate doing this
        // correctly by scaling the tolerance value using the same mechanism as Fitz. This
        // approximation will fail if the scale between axes is drastically different. An
        // alternative would be to use transform specific flattening but I haven't seen that done
        // anywhere.
        let tolerance = scaled_tolerance(tolerance, &self.transform);
        let mut path = path.flatten(tolerance);

        if !style.dash_array.is_empty() {
            path = dash_path(&path, &style.dash_array, style.dash_offset);
        }
        let stroked = stroke_to_path(&path, style);
        self.fill(&stroked, src, options);
    }

    /// Fills the rect `x`, `y,`, `width`, `height` with `src`. If the result is an
    /// integer aligned rectangle performance will be faster than filling a rectangular path.
    pub fn fill_rect(
        &mut self,
        x: f32,
        y: f32,
        width: f32,
        height: f32,
        src: &Source,
        options: &DrawOptions,
    ) {
        let ix = x as i32;
        let iy = y as i32;
        let iwidth = width as i32;
        let iheight = height as i32;
        let integer_rect =
            ix as f32 == x && iy as f32 == y && iwidth as f32 == width && iheight as f32 == height;

        if self.transform == Transform::identity() && integer_rect && self.clip_stack.is_empty() {
            let bounds = intrect(0, 0, self.width, self.height);
            let mut irect = intrect(ix, iy, ix + iwidth, iy + iheight);
            irect = match irect.intersection(&bounds) {
                Some(irect) => irect,
                _ => return,
            };
            self.composite(src, None, irect, irect, options.blend_mode, options.alpha);
        } else {
            let mut pb = PathBuilder::new();
            pb.rect(x, y, width, height);
            self.fill(&pb.finish(), src, options);
        }
    }

    /// Fills `path` with `src`
    pub fn fill(&mut self, path: &Path, src: &Source, options: &DrawOptions) {
        self.apply_path(path);
        let bounds = self.rasterizer.get_bounds();
        if bounds.size().width > 0 && bounds.size().height > 0 {
            match options.antialias {
                AntialiasMode::None => {
                    let mut blitter = MaskBlitter::new(
                        bounds.min.x,
                        bounds.min.y,
                        bounds.size().width,
                        bounds.size().height,
                    );
                    self.rasterizer.rasterize(&mut blitter, path.winding);
                    self.composite(
                        src,
                        Some(&blitter.buf),
                        bounds,
                        bounds,
                        options.blend_mode,
                        options.alpha,
                    );
                }
                AntialiasMode::Gray => {
                    let mut blitter = MaskSuperBlitter::new(
                        bounds.min.x,
                        bounds.min.y,
                        bounds.size().width,
                        bounds.size().height,
                    );
                    self.rasterizer.rasterize(&mut blitter, path.winding);
                    self.composite(
                        src,
                        Some(&blitter.buf),
                        bounds,
                        bounds,
                        options.blend_mode,
                        options.alpha,
                    );
                }
            }
        }
        self.rasterizer.reset();
    }

    /// Fills the current clip with the solid color `solid`
    pub fn clear(&mut self, solid: SolidSource) {
        let mut pb = PathBuilder::new();
        if self.clip_stack.is_empty() {
            let color = solid.to_u32();
            for pixel in self.buf.as_mut() {
                *pixel = color;
            }
        } else {
            let ctm = self.transform;
            self.transform = Transform::identity();
            pb.rect(0., 0., self.width as f32, self.height as f32);
            self.fill(
                &pb.finish(),
                &Source::Solid(solid),
                &DrawOptions {
                    blend_mode: BlendMode::Src,
                    alpha: 1.,
                    antialias: AntialiasMode::Gray,
                },
            );
            self.transform = ctm;
        }
    }

    #[cfg(feature = "text")]
    pub fn draw_text(
        &mut self,
        font: &fk::Font,
        point_size: f32,
        text: &str,
        start: Point,
        src: &Source,
        options: &DrawOptions,
    ) {
        let mut start = fk::vec2f(start.x, start.y);
        let mut ids = Vec::new();
        let mut positions = Vec::new();
        for c in text.chars() {
            let id = font.glyph_for_char(c).unwrap();
            ids.push(id);
            positions.push(Point::new(start.x(), start.y()));
            start += font.advance(id).unwrap() * point_size / 24. / 96.;
        }
        self.draw_glyphs(font, point_size, &ids, &positions, src, options);
    }

    #[cfg(feature = "text")]
    pub fn draw_glyphs(
        &mut self,
        font: &fk::Font,
        point_size: f32,
        ids: &[u32],
        positions: &[Point],
        src: &Source,
        options: &DrawOptions,
    ) {
        let antialias_mode = match options.antialias {
            AntialiasMode::Gray => fk::RasterizationOptions::GrayscaleAa,
            AntialiasMode::None => fk::RasterizationOptions::Bilevel,
        };
        let mut combined_bounds = euclid::Rect::zero();
        for (id, position) in ids.iter().zip(positions.iter()) {
            let bounds = font.raster_bounds(
                *id,
                point_size,
                fk::Transform2F::row_major(
                    self.transform.m11,
                    self.transform.m12,
                    self.transform.m21,
                    self.transform.m22,
                    0.,
                    0.,
                )
                .translate(fk::vec2f(position.x, position.y)),
                fk::HintingOptions::None,
                antialias_mode,
            );
            combined_bounds = match bounds {
                Ok(bounds) => {
                    let origin = bounds.origin();
                    let size = bounds.size();
                    let bounds = euclid::Rect::new(
                        IntPoint::new(origin.x(), origin.y()),
                        euclid::Size2D::new(size.x(), size.y()),
                    );
                    combined_bounds.union(&bounds)
                }
                _ => panic!(),
            }
        }

        /*let mut canvas = Canvas::new(&euclid::Size2D::new(combined_bounds.size.width as u32,
        combined_bounds.size.height as u32), Format::A8);*/
        let mut canvas = fk::Canvas::new(
            fk::vec2i(combined_bounds.size.width, combined_bounds.size.height),
            fk::Format::A8,
        );
        for (id, position) in ids.iter().zip(positions.iter()) {
            let mut position = self.transform.transform_point(*position);
            position.x -= combined_bounds.origin.x as f32;
            position.y -= combined_bounds.origin.y as f32;
            font.rasterize_glyph(
                &mut canvas,
                *id,
                point_size,
                fk::Transform2F::row_major(
                    self.transform.m11,
                    self.transform.m12,
                    self.transform.m21,
                    self.transform.m22,
                    0.,
                    0.,
                )
                .translate(fk::vec2f(position.x, position.y)),
                fk::HintingOptions::None,
                antialias_mode,
            )
            .unwrap();
        }

        self.composite(
            src,
            Some(&canvas.pixels),
            combined_bounds.to_box2d(),
            combined_bounds.to_box2d(),
            options.blend_mode,
            1.,
        );
    }
}

impl DrawTarget {
    fn choose_blitter<'a, 'b, 'c>(
        mask: Option<&[u8]>,
        clip_stack: &'a Vec<Clip>,
        blitter_storage: &'b mut ShaderBlitterStorage<'a>,
        shader: &'a dyn Shader,
        blend: BlendMode,
        dest: &'a mut [u32],
        dest_bounds: IntRect,
        width: i32,
    ) -> &'b mut dyn Blitter {
        *blitter_storage = match (mask, clip_stack.last()) {
            (
                Some(_mask),
                Some(Clip {
                    rect: _,
                    mask: Some(clip),
                }),
            ) => {
                if blend == BlendMode::SrcOver {
                    let scb = ShaderClipMaskBlitter {
                        x: dest_bounds.min.x,
                        y: dest_bounds.min.y,
                        shader,
                        tmp: vec![0; width as usize],
                        dest,
                        dest_stride: dest_bounds.size().width,
                        clip,
                        clip_stride: width,
                    };
                    ShaderBlitterStorage::ShaderClipMaskBlitter(scb)
                } else {
                    let blend_fn = build_blend_proc::<BlendRowMaskClip>(blend);
                    let scb_blend = ShaderClipBlendMaskBlitter {
                        x: dest_bounds.min.x,
                        y: dest_bounds.min.y,
                        shader,
                        tmp: vec![0; width as usize],
                        dest,
                        dest_stride: dest_bounds.size().width,
                        clip,
                        clip_stride: width,
                        blend_fn,
                    };
                    ShaderBlitterStorage::ShaderClipBlendMaskBlitter(scb_blend)
                }
            }
            (Some(_mask), _) => {
                if blend == BlendMode::SrcOver {
                    let sb = ShaderMaskBlitter {
                        x: dest_bounds.min.x,
                        y: dest_bounds.min.y,
                        shader: &*shader,
                        tmp: vec![0; width as usize],
                        dest,
                        dest_stride: dest_bounds.size().width,
                    };
                    ShaderBlitterStorage::ShaderMaskBlitter(sb)
                } else {
                    let blend_fn = build_blend_proc::<BlendRowMask>(blend);
                    let sb_blend = ShaderBlendMaskBlitter {
                        x: dest_bounds.min.x,
                        y: dest_bounds.min.y,
                        shader: &*shader,
                        tmp: vec![0; width as usize],
                        dest,
                        dest_stride: dest_bounds.size().width,
                        blend_fn,
                    };
                    ShaderBlitterStorage::ShaderBlendMaskBlitter(sb_blend)
                }
            }
            (None, _) => {
                let blend_fn = build_blend_proc::<BlendRow>(blend);
                let sb_blend = ShaderBlendBlitter {
                    x: dest_bounds.min.x,
                    y: dest_bounds.min.y,
                    shader: &*shader,
                    tmp: vec![0; width as usize],
                    dest,
                    dest_stride: dest_bounds.size().width,
                    blend_fn,
                };
                ShaderBlitterStorage::ShaderBlendBlitter(sb_blend)
            }
        };

        match blitter_storage {
            ShaderBlitterStorage::None => unreachable!(),
            ShaderBlitterStorage::ShaderBlendMaskBlitter(s) => s,
            ShaderBlitterStorage::ShaderClipBlendMaskBlitter(s) => s,
            ShaderBlitterStorage::ShaderMaskBlitter(s) => s,
            ShaderBlitterStorage::ShaderClipMaskBlitter(s) => s,
            ShaderBlitterStorage::ShaderBlendBlitter(s) => s,
        }
    }
}

impl<Backing: AsRef<[u32]> + AsMut<[u32]>> DrawTarget<Backing> {
    /// `mask_rect` is in DrawTarget space. i.e size is the size of the mask and origin is the position.
    /// you can not render a part of the mask
    fn composite(
        &mut self,
        src: &Source,
        mask: Option<&[u8]>,
        mask_rect: IntRect,
        mut rect: IntRect,
        blend: BlendMode,
        alpha: f32,
    ) {
        let ti = self.transform.inverse();
        let ti = if let Some(ti) = ti {
            ti
        } else {
            // the transform is not invertible so we have nothing to draw
            return;
        };

        let clip_bounds = self.clip_bounds();

        let (dest, dest_bounds) = match self.layer_stack.last_mut() {
            Some(layer) => (&mut layer.buf[..], layer.rect),
            None => (self.buf.as_mut(), intrect(0, 0, self.width, self.height)),
        };

        rect = rect
            .intersection_unchecked(&clip_bounds)
            .intersection_unchecked(&dest_bounds)
            .intersection_unchecked(&mask_rect);
        if rect.is_empty() {
            return;
        }

        let mut shader_storage = ShaderStorage::None;
        let shader = choose_shader(&ti, src, alpha, &mut shader_storage);

        let mut blitter_storage = ShaderBlitterStorage::None;
        let blitter = DrawTarget::choose_blitter(
            mask,
            &self.clip_stack,
            &mut blitter_storage,
            shader,
            blend,
            dest,
            dest_bounds,
            self.width,
        );

        match mask {
            Some(mask) => {
                for y in rect.min.y..rect.max.y {
                    let mask_row = (y - mask_rect.min.y) * mask_rect.size().width;
                    let mask_start = (mask_row + rect.min.x - mask_rect.min.x) as usize;
                    let mask_end = (mask_row + rect.max.x - mask_rect.min.x) as usize;
                    blitter.blit_span(y, rect.min.x, rect.max.x, &mask[mask_start..mask_end]);
                }
            }
            None => {
                for y in rect.min.y..rect.max.y {
                    let empty_mask = [];
                    blitter.blit_span(y, rect.min.x, rect.max.x, &empty_mask[..]);
                }
            }
        };
    }

    /// Draws `src_rect` of `src` at `dst`. The current transform and clip are ignored
    pub fn composite_surface<F: Fn(&[u32], &mut [u32]), SrcBacking: AsRef<[u32]>>(
        &mut self,
        src: &DrawTarget<SrcBacking>,
        src_rect: IntRect,
        dst: IntPoint,
        f: F,
    ) {
        let dst_rect = intrect(0, 0, self.width, self.height);

        // intersect the src_rect with the source size so that we don't go out of bounds
        let src_rect = src_rect.intersection_unchecked(&intrect(0, 0, src.width, src.height));

        let src_rect = dst_rect
            .intersection_unchecked(&src_rect.translate(dst.to_vector()))
            .translate(-dst.to_vector());

        // clamp requires Float so open code it
        let dst = IntPoint::new(
            dst.x.max(dst_rect.min.x).min(dst_rect.max.x),
            dst.y.max(dst_rect.min.y).min(dst_rect.max.y),
        );

        if src_rect.is_empty() {
            return;
        }

        for y in src_rect.min.y..src_rect.max.y {
            let dst_row_start = (dst.x + (dst.y + y - src_rect.min.y) * self.width) as usize;
            let dst_row_end = dst_row_start + src_rect.size().width as usize;
            let src_row_start = (src_rect.min.x + y * src.width) as usize;
            let src_row_end = src_row_start + src_rect.size().width as usize;
            f(
                &src.buf.as_ref()[src_row_start..src_row_end],
                &mut self.buf.as_mut()[dst_row_start..dst_row_end],
            );
        }
    }

    /// Draws `src_rect` of `src` at `dst`. The current transform and clip are ignored.
    /// `src_rect` is clamped to (0, 0, src.width, src.height).
    pub fn copy_surface<SrcBacking: AsRef<[u32]>>(
        &mut self,
        src: &DrawTarget<SrcBacking>,
        src_rect: IntRect,
        dst: IntPoint,
    ) {
        self.composite_surface(src, src_rect, dst, |src, dst| dst.copy_from_slice(src))
    }

    /// Blends `src_rect` of `src` at `dst`using `blend` mode.
    /// The current transform and clip are ignored.
    /// `src_rect` is clamped to (0, 0, `src.width`, `src.height`).
    pub fn blend_surface<SrcBacking: AsRef<[u32]>>(
        &mut self,
        src: &DrawTarget<SrcBacking>,
        src_rect: IntRect,
        dst: IntPoint,
        blend: BlendMode,
    ) {
        let blend_fn = build_blend_proc::<BlendRow>(blend);
        self.composite_surface(src, src_rect, dst, |src, dst| {
            blend_fn(src, dst);
        });
    }

    /// Blends `src_rect` of `src` at `dst` using `alpha`. The current transform and clip are ignored.
    /// `src_rect` is clamped to (0, 0, `src.width`, `src.height`).
    pub fn blend_surface_with_alpha<SrcBacking: AsRef<[u32]>>(
        &mut self,
        src: &DrawTarget<SrcBacking>,
        src_rect: IntRect,
        dst: IntPoint,
        alpha: f32,
    ) {
        let alpha = (alpha * 255. + 0.5) as u8;

        self.composite_surface(src, src_rect, dst, |src, dst| {
            over_in_row(src, dst, alpha as u32);
        });
    }

    /// Returns a reference to the underlying pixel data
    pub fn get_data(&self) -> &[u32] {
        self.buf.as_ref()
    }

    /// Returns a mut reference to the underlying pixel data as ARGB with a representation
    /// like: (A << 24) | (R << 16) | (G << 8) | B
    pub fn get_data_mut(&mut self) -> &mut [u32] {
        self.buf.as_mut()
    }

    /// Returns a reference to the underlying pixel data as individual bytes with the order BGRA
    /// on little endian.
    pub fn get_data_u8(&self) -> &[u8] {
        let buf = self.buf.as_ref();
        let p = buf.as_ptr();
        let len = buf.len();
        // we want to return an [u8] slice instead of a [u32] slice. This is a safe thing to
        // do because requirements of a [u32] slice are stricter.
        unsafe { std::slice::from_raw_parts(p as *const u8, len * std::mem::size_of::<u32>()) }
    }

    /// Returns a mut reference to the underlying pixel data as individual bytes with the order BGRA
    /// on little endian.
    pub fn get_data_u8_mut(&mut self) -> &mut [u8] {
        let buf = self.buf.as_mut();
        let p = buf.as_mut_ptr();
        let len = buf.len();
        // we want to return an [u8] slice instead of a [u32] slice. This is a safe thing to
        // do because requirements of a [u32] slice are stricter.
        unsafe { std::slice::from_raw_parts_mut(p as *mut u8, len * std::mem::size_of::<u32>()) }
    }

    /// Take ownership of the buffer backing the DrawTarget
    pub fn into_inner(self) -> Backing {
        self.buf
    }

    /// Saves the current pixel to a png file at `path`
    #[cfg(feature = "png")]
    pub fn write_png<P: AsRef<std::path::Path>>(&self, path: P) -> Result<(), png::EncodingError> {
        let file = File::create(path)?;

        let w = &mut BufWriter::new(file);

        let mut encoder = png::Encoder::new(w, self.width as u32, self.height as u32);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder.write_header()?;
        let buf = self.buf.as_ref();
        let mut output = Vec::with_capacity(buf.len() * 4);

        for pixel in buf {
            let a = (pixel >> 24) & 0xffu32;
            let mut r = (pixel >> 16) & 0xffu32;
            let mut g = (pixel >> 8) & 0xffu32;
            let mut b = (pixel >> 0) & 0xffu32;

            if a > 0u32 {
                r = r * 255u32 / a;
                g = g * 255u32 / a;
                b = b * 255u32 / a;
            }

            output.push(r as u8);
            output.push(g as u8);
            output.push(b as u8);
            output.push(a as u8);
        }

        writer.write_image_data(&output)
    }
}

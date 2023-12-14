use sw_composite::*;

use crate::draw_target::{ExtendMode, FilterMode, Source};
use crate::{IntPoint, Point, Transform};

use euclid::vec2;
use std::marker::PhantomData;

pub trait Blitter {
    fn blit_span(&mut self, y: i32, x1: i32, x2: i32, mask: &[u8]);
}

pub trait RasterBlitter {
    fn blit_span(&mut self, y: i32, x1: i32, x2: i32);
}

pub struct MaskSuperBlitter {
    pub x: i32,
    pub y: i32,
    width: i32,
    pub buf: Vec<u8>,
}

const SHIFT: i32 = crate::rasterizer::SAMPLE_SHIFT;
const SCALE: i32 = 1 << SHIFT;
const MASK: i32 = SCALE - 1;
const SUPER_MASK: i32 = (1 << SHIFT) - 1;

fn coverage_to_partial_alpha(mut aa: i32) -> u8 {
    aa <<= 8 - 2 * SHIFT;
    return aa as u8;
}

impl MaskSuperBlitter {
    pub fn new(x: i32, y: i32, width: i32, height: i32) -> MaskSuperBlitter {
        MaskSuperBlitter {
            x: x * SCALE,
            y: y * SCALE,
            width,
            // we can end up writing one byte past the end of the buffer so allocate that
            // padding to avoid needing to do an extra check
            buf: vec![0; (width * height) as usize + 1],
        }
    }
}

// Perform this tricky subtract, to avoid overflowing to 256. Our caller should
// only ever call us with at most enough to hit 256 (never larger), so it is
// enough to just subtract the high-bit. Actually clamping with a branch would
// be slower (e.g. if (tmp > 255) tmp = 255;)
fn saturated_add(a: u8, b: u8) -> u8 {
    let tmp = a as u32 + b as u32;
    let result = tmp - (tmp >> 8);
    result as u8
}

impl RasterBlitter for MaskSuperBlitter {
    fn blit_span(&mut self, mut y: i32, mut x1: i32, mut x2: i32) {
        y -= self.y;
        x1 -= self.x;
        x2 -= self.x;
        x2 = x2.min(self.width * SCALE);
        let max: u8 = ((1 << (8 - SHIFT)) - (((y & MASK) + 1) >> SHIFT)) as u8;
        let start = (y / 4 * self.width) as usize;

        let mut fb = x1 & SUPER_MASK;
        let fe = x2 & SUPER_MASK;
        let b = &mut self.buf[start + (x1 >> SHIFT) as usize..start + (x2 >> SHIFT) as usize + 1];
        let len = b.len();

        // invert the alpha on the left side
        if len == 0 {
        } else if len == 1 {
            b[0] = saturated_add(b[0], coverage_to_partial_alpha(fe - fb));
        } else {
            fb = (1 << SHIFT) - fb;
            b[0] = saturated_add(b[0], coverage_to_partial_alpha(fb));

            // Rust seems to emit bounds checks here when it should be able to avoid them
            for i in &mut b[1..len - 1] {
                *i += max;
            }
            b[len - 1] = saturated_add(b[len - 1], coverage_to_partial_alpha(fe));
        }
    }
}

pub struct MaskBlitter {
    pub x: i32,
    pub y: i32,
    width: i32,
    pub buf: Vec<u8>,
}

impl MaskBlitter {
    pub fn new(x: i32, y: i32, width: i32, height: i32) -> MaskBlitter {
        MaskBlitter {
            x: x * SCALE,
            y: y * SCALE,
            width,
            // we can end up writing one byte past the end of the buffer so allocate that
            // padding to avoid needing to do an extra check
            buf: vec![0; (width * height) as usize + 1],
        }
    }
}

impl RasterBlitter for MaskBlitter {
    fn blit_span(&mut self, mut y: i32, mut x1: i32, mut x2: i32) {
        y -= self.y;
        x1 -= self.x;
        x2 -= self.x;
        if y % SCALE != 0 {
            return;
        }

        x2 = x2.min(self.width * SCALE);

        x1 >>= SHIFT;
        x2 >>= SHIFT;

        for i in x1..x2 {
            self.buf[(y / 4 * self.width + i) as usize] = 0xff;
        }
    }
}

pub trait Shader {
    fn shade_span(&self, x: i32, y: i32, dest: &mut [u32], count: usize);
}

pub struct SolidShader {
    pub color: u32,
}

impl Shader for SolidShader {
    fn shade_span(&self, _x: i32, _y: i32, dest: &mut [u32], count: usize) {
        for i in 0..count {
            dest[i] = self.color;
        }
    }
}

fn transform_to_fixed(transform: &Transform) -> MatrixFixedPoint {
    MatrixFixedPoint {
        xx: float_to_fixed(transform.m11),
        xy: float_to_fixed(transform.m21),
        yx: float_to_fixed(transform.m12),
        yy: float_to_fixed(transform.m22),
        x0: float_to_fixed(transform.m31),
        y0: float_to_fixed(transform.m32),
    }
}

pub struct TransformedImageShader<'a, 'b, Fetch: PixelFetch> {
    image: &'a Image<'b>,
    xfm: MatrixFixedPoint,
    fetch: PhantomData<Fetch>,
}

impl<'a, 'b, Fetch: PixelFetch> TransformedImageShader<'a, 'b, Fetch> {
    pub fn new(
        image: &'a Image<'b>,
        transform: &Transform,
    ) -> TransformedImageShader<'a, 'b, Fetch> {
        TransformedImageShader {
            image,
            xfm: transform_to_fixed(
                &transform
                    .pre_translate(vec2(0.5, 0.5))
                    .then_translate(vec2(-0.5, -0.5)),
            ),
            fetch: PhantomData,
        }
    }
}

impl<'a, 'b, Fetch: PixelFetch> Shader for TransformedImageShader<'a, 'b, Fetch> {
    fn shade_span(&self, mut x: i32, y: i32, dest: &mut [u32], count: usize) {
        for i in 0..count {
            let p = self.xfm.transform(x as u16, y as u16);
            dest[i] = fetch_bilinear::<Fetch>(self.image, p.x, p.y);
            x += 1;
        }
    }
}

pub struct TransformedImageAlphaShader<'a, 'b, Fetch: PixelFetch> {
    image: &'a Image<'b>,
    xfm: MatrixFixedPoint,
    alpha: u32,
    fetch: PhantomData<Fetch>,
}

impl<'a, 'b, Fetch: PixelFetch> TransformedImageAlphaShader<'a, 'b, Fetch> {
    pub fn new(
        image: &'a Image<'b>,
        transform: &Transform,
        alpha: u32,
    ) -> TransformedImageAlphaShader<'a, 'b, Fetch> {
        TransformedImageAlphaShader {
            image,
            xfm: transform_to_fixed(
                &transform
                    .pre_translate(vec2(0.5, 0.5))
                    .then_translate(vec2(-0.5, -0.5)),
            ),
            alpha: alpha_to_alpha256(alpha),
            fetch: PhantomData,
        }
    }
}

impl<'a, 'b, Fetch: PixelFetch> Shader for TransformedImageAlphaShader<'a, 'b, Fetch> {
    fn shade_span(&self, mut x: i32, y: i32, dest: &mut [u32], count: usize) {
        for i in 0..count {
            let p = self.xfm.transform(x as u16, y as u16);
            dest[i] = fetch_bilinear_alpha::<Fetch>(self.image, p.x, p.y, self.alpha);
            x += 1;
        }
    }
}

pub struct TransformedNearestImageShader<'a, 'b, Fetch: PixelFetch> {
    image: &'a Image<'b>,
    xfm: MatrixFixedPoint,
    fetch: PhantomData<Fetch>,
}

impl<'a, 'b, Fetch: PixelFetch> TransformedNearestImageShader<'a, 'b, Fetch> {
    pub fn new(
        image: &'a Image<'b>,
        transform: &Transform,
    ) -> TransformedNearestImageShader<'a, 'b, Fetch> {
        TransformedNearestImageShader {
            image,
            xfm: transform_to_fixed(
                &transform
                    .pre_translate(vec2(0.5, 0.5))
                    .then_translate(vec2(-0.5, -0.5)),
            ),
            fetch: PhantomData,
        }
    }
}

impl<'a, 'b, Fetch: PixelFetch> Shader for TransformedNearestImageShader<'a, 'b, Fetch> {
    fn shade_span(&self, mut x: i32, y: i32, dest: &mut [u32], count: usize) {
        for i in 0..count {
            let p = self.xfm.transform(x as u16, y as u16);
            dest[i] = fetch_nearest::<Fetch>(self.image, p.x, p.y);
            x += 1;
        }
    }
}

pub struct TransformedNearestImageAlphaShader<'a, 'b, Fetch: PixelFetch> {
    image: &'a Image<'b>,
    xfm: MatrixFixedPoint,
    alpha: u32,
    fetch: PhantomData<Fetch>,
}

impl<'a, 'b, Fetch: PixelFetch> TransformedNearestImageAlphaShader<'a, 'b, Fetch> {
    pub fn new(
        image: &'a Image<'b>,
        transform: &Transform,
        alpha: u32,
    ) -> TransformedNearestImageAlphaShader<'a, 'b, Fetch> {
        TransformedNearestImageAlphaShader {
            image,
            xfm: transform_to_fixed(
                &transform
                    .pre_translate(vec2(0.5, 0.5))
                    .then_translate(vec2(-0.5, -0.5)),
            ),
            alpha: alpha_to_alpha256(alpha),
            fetch: PhantomData,
        }
    }
}

impl<'a, 'b, Fetch: PixelFetch> Shader for TransformedNearestImageAlphaShader<'a, 'b, Fetch> {
    fn shade_span(&self, mut x: i32, y: i32, dest: &mut [u32], count: usize) {
        for i in 0..count {
            let p = self.xfm.transform(x as u16, y as u16);
            dest[i] = fetch_nearest_alpha::<Fetch>(self.image, p.x, p.y, self.alpha);
            x += 1;
        }
    }
}

pub struct ImagePadAlphaShader<'a, 'b> {
    image: &'a Image<'b>,
    offset_x: i32,
    offset_y: i32,
    alpha: u32,
}

impl<'a, 'b> ImagePadAlphaShader<'a, 'b> {
    pub fn new(image: &'a Image<'b>, x: i32, y: i32, alpha: u32) -> ImagePadAlphaShader<'a, 'b> {
        ImagePadAlphaShader {
            image,
            offset_x: x,
            offset_y: y,
            alpha: alpha_to_alpha256(alpha),
        }
    }
}

impl<'a, 'b> Shader for ImagePadAlphaShader<'a, 'b> {
    fn shade_span(&self, mut x: i32, mut y: i32, dest: &mut [u32], mut count: usize) {
        x += self.offset_x;
        y += self.offset_y;
        let mut dest_x = 0;

        if y < 0 {
            y = 0;
        } else if y >= self.image.height {
            y = self.image.height - 1;
        }

        while x < 0 && count > 0 {
            dest[dest_x] = alpha_mul(self.image.data[(self.image.width * y) as usize], self.alpha);
            x += 1;
            dest_x += 1;
            count -= 1;
        }
        if count > 0 && x < self.image.width {
            let len = count.min((self.image.width - x) as usize);
            let d = &mut dest[dest_x..dest_x + len];
            let src_start = (self.image.width * y + x) as usize;
            let s = &self.image.data[src_start..src_start + len];

            for (d, s) in d.iter_mut().zip(s) {
                *d = alpha_mul(*s, self.alpha);
            }

            dest_x += len;
            count -= len;
        }
        while count > 0 {
            dest[dest_x] = alpha_mul(
                self.image.data[(self.image.width * y + self.image.width - 1) as usize],
                self.alpha,
            );
            dest_x += 1;
            count -= 1;
        }
    }
}

pub struct ImageRepeatAlphaShader<'a, 'b> {
    image: &'a Image<'b>,
    offset_x: i32,
    offset_y: i32,
    alpha: u32,
}

impl<'a, 'b> ImageRepeatAlphaShader<'a, 'b> {
    pub fn new(image: &'a Image<'b>, x: i32, y: i32, alpha: u32) -> ImageRepeatAlphaShader<'a, 'b> {
        ImageRepeatAlphaShader {
            image,
            offset_x: x,
            offset_y: y,
            alpha: alpha_to_alpha256(alpha),
        }
    }
}

impl<'a, 'b> Shader for ImageRepeatAlphaShader<'a, 'b> {
    fn shade_span(&self, mut x: i32, mut y: i32, dest: &mut [u32], mut count: usize) {
        x += self.offset_x;
        y += self.offset_y;
        let mut dest_x = 0;

        let y = y.rem_euclid(self.image.height);
        let mut x = x.rem_euclid(self.image.width);

        while count > 0 {
            let len = count.min((self.image.width - x) as usize);
            let d = &mut dest[dest_x..dest_x + len];
            let src_start = (self.image.width * y + x) as usize;
            let s = &self.image.data[src_start..src_start + len];

            for (d, s) in d.iter_mut().zip(s) {
                *d = alpha_mul(*s, self.alpha);
            }

            dest_x += len;
            count -= len;
            x = 0;
        }
    }
}

pub struct RadialGradientShader {
    gradient: Box<GradientSource>,
    spread: Spread,
}

impl RadialGradientShader {
    pub fn new(
        gradient: &Gradient,
        transform: &Transform,
        spread: Spread,
        alpha: u32,
    ) -> RadialGradientShader {
        RadialGradientShader {
            gradient: gradient.make_source(
                &transform_to_fixed(&transform.pre_translate(vec2(0.5, 0.5))),
                alpha,
            ),
            spread,
        }
    }
}

impl Shader for RadialGradientShader {
    fn shade_span(&self, mut x: i32, y: i32, dest: &mut [u32], count: usize) {
        for i in 0..count {
            dest[i] = self
                .gradient
                .radial_gradient_eval(x as u16, y as u16, self.spread);
            x += 1;
        }
    }
}

pub struct TwoCircleRadialGradientShader {
    gradient: Box<TwoCircleRadialGradientSource>,
    spread: Spread,
}

impl TwoCircleRadialGradientShader {
    pub fn new(
        gradient: &Gradient,
        transform: &Transform,
        c1: Point,
        r1: f32,
        c2: Point,
        r2: f32,
        spread: Spread,
        alpha: u32,
    ) -> TwoCircleRadialGradientShader {
        TwoCircleRadialGradientShader {
            gradient: gradient.make_two_circle_source(
                c1.x,
                c1.y,
                r1,
                c2.x,
                c2.y,
                r2,
                &transform_to_fixed(&transform.pre_translate(vec2(0.5, 0.5))),
                alpha,
            ),
            spread,
        }
    }
}

impl Shader for TwoCircleRadialGradientShader {
    fn shade_span(&self, mut x: i32, y: i32, dest: &mut [u32], count: usize) {
        for i in 0..count {
            dest[i] = self.gradient.eval(x as u16, y as u16, self.spread);
            x += 1;
        }
    }
}

pub struct SweepGradientShader {
    gradient: Box<SweepGradientSource>,
    spread: Spread,
}

impl SweepGradientShader {
    pub fn new(
        gradient: &Gradient,
        transform: &Transform,
        start_angle: f32,
        end_angle: f32,
        spread: Spread,
        alpha: u32,
    ) -> SweepGradientShader {
        SweepGradientShader {
            gradient: gradient.make_sweep_source(
                start_angle,
                end_angle,
                &transform_to_fixed(&transform.pre_translate(vec2(0.5, 0.5))),
                alpha,
            ),
            spread,
        }
    }
}

impl Shader for SweepGradientShader {
    fn shade_span(&self, mut x: i32, y: i32, dest: &mut [u32], count: usize) {
        for i in 0..count {
            dest[i] = self.gradient.eval(x as u16, y as u16, self.spread);
            x += 1;
        }
    }
}

pub struct LinearGradientShader {
    gradient: Box<GradientSource>,
    spread: Spread,
}

impl LinearGradientShader {
    pub fn new(
        gradient: &Gradient,
        transform: &Transform,
        spread: Spread,
        alpha: u32,
    ) -> LinearGradientShader {
        LinearGradientShader {
            gradient: gradient.make_source(
                &transform_to_fixed(&transform.pre_translate(vec2(0.5, 0.5))),
                alpha,
            ),
            spread,
        }
    }
}

impl Shader for LinearGradientShader {
    fn shade_span(&self, mut x: i32, y: i32, dest: &mut [u32], count: usize) {
        for i in 0..count {
            dest[i] = self
                .gradient
                .linear_gradient_eval(x as u16, y as u16, self.spread);
            x += 1;
        }
    }
}

pub struct ShaderMaskBlitter<'a> {
    pub x: i32,
    pub y: i32,
    pub shader: &'a dyn Shader,
    pub tmp: Vec<u32>,
    pub dest: &'a mut [u32],
    pub dest_stride: i32,
}

impl<'a> Blitter for ShaderMaskBlitter<'a> {
    fn blit_span(&mut self, y: i32, x1: i32, x2: i32, mask: &[u8]) {
        let dest_row = (y - self.y) * self.dest_stride;
        let count = (x2 - x1) as usize;
        self.shader.shade_span(x1, y, &mut self.tmp[..], count);
        for i in 0..count {
            let mask = mask[i] as u32;
            if mask != 0 {
                self.dest[(dest_row + x1 - self.x) as usize + i] = over_in(
                    self.tmp[i],
                    self.dest[(dest_row + x1 - self.x) as usize + i],
                    mask,
                );
            }
        }
    }
}

pub struct ShaderClipMaskBlitter<'a> {
    pub x: i32,
    pub y: i32,
    pub shader: &'a dyn Shader,
    pub tmp: Vec<u32>,
    pub dest: &'a mut [u32],
    pub dest_stride: i32,
    pub clip: &'a [u8],
    pub clip_stride: i32,
}

impl<'a> Blitter for ShaderClipMaskBlitter<'a> {
    fn blit_span(&mut self, y: i32, x1: i32, x2: i32, mask: &[u8]) {
        let dest_row = (y - self.y) * self.dest_stride;
        let clip_row = y * self.clip_stride;
        let count = (x2 - x1) as usize;
        self.shader.shade_span(x1, y, &mut self.tmp[..], count);
        for i in 0..count {
            let mask = mask[i] as u32;
            let clip = self.clip[(clip_row + x1) as usize + i] as u32;
            if mask != 0 && clip != 0 {
                self.dest[(dest_row + x1 - self.x) as usize + i] = over_in_in(
                    self.tmp[i],
                    self.dest[(dest_row + x1 - self.x) as usize + i],
                    mask,
                    clip,
                );
            }
        }
    }
}

pub struct ShaderClipBlendMaskBlitter<'a> {
    pub x: i32,
    pub y: i32,
    pub shader: &'a dyn Shader,
    pub tmp: Vec<u32>,
    pub dest: &'a mut [u32],
    pub dest_stride: i32,
    pub clip: &'a [u8],
    pub clip_stride: i32,
    pub blend_fn: fn(&[u32], &[u8], &[u8], &mut [u32]),
}

impl<'a> Blitter for ShaderClipBlendMaskBlitter<'a> {
    fn blit_span(&mut self, y: i32, x1: i32, x2: i32, mask: &[u8]) {
        let dest_row = (y - self.y) * self.dest_stride;
        let clip_row = y * self.clip_stride;
        let count = (x2 - x1) as usize;
        self.shader.shade_span(x1, y, &mut self.tmp[..], count);
        (self.blend_fn)(
            &self.tmp[..],
            mask,
            &self.clip[(clip_row + x1) as usize..],
            &mut self.dest[(dest_row + x1 - self.x) as usize..],
        )
    }
}

pub struct ShaderBlendMaskBlitter<'a> {
    pub x: i32,
    pub y: i32,
    pub shader: &'a dyn Shader,
    pub tmp: Vec<u32>,
    pub dest: &'a mut [u32],
    pub dest_stride: i32,
    pub blend_fn: fn(&[u32], &[u8], &mut [u32]),
}

impl<'a> Blitter for ShaderBlendMaskBlitter<'a> {
    fn blit_span(&mut self, y: i32, x1: i32, x2: i32, mask: &[u8]) {
        let dest_row = (y - self.y) * self.dest_stride;
        let count = (x2 - x1) as usize;
        self.shader.shade_span(x1, y, &mut self.tmp[..], count);
        (self.blend_fn)(
            &self.tmp[..],
            mask,
            &mut self.dest[(dest_row + x1 - self.x) as usize..],
        )
    }
}

pub struct ShaderBlendBlitter<'a> {
    pub x: i32,
    pub y: i32,
    pub shader: &'a dyn Shader,
    pub tmp: Vec<u32>,
    pub dest: &'a mut [u32],
    pub dest_stride: i32,
    pub blend_fn: fn(&[u32], &mut [u32]),
}

impl<'a> Blitter for ShaderBlendBlitter<'a> {
    fn blit_span(&mut self, y: i32, x1: i32, x2: i32, _: &[u8]) {
        let dest_row = (y - self.y) * self.dest_stride;
        let count = (x2 - x1) as usize;
        self.shader.shade_span(x1, y, &mut self.tmp[..], count);
        (self.blend_fn)(
            &self.tmp[..],
            &mut self.dest[(dest_row + x1 - self.x) as usize..],
        )
    }
}

fn is_integer_transform(trans: &Transform) -> Option<IntPoint> {
    if trans.m11 == 1. && trans.m12 == 0. && trans.m21 == 0. && trans.m22 == 1. {
        let x = trans.m31 as i32;
        let y = trans.m32 as i32;
        if x as f32 == trans.m31 && y as f32 == trans.m32 {
            return Some(IntPoint::new(x, y));
        }
    }
    None
}

pub enum ShaderStorage<'a, 'b> {
    None,
    Solid(SolidShader),
    ImagePadAlpha(ImagePadAlphaShader<'a, 'b>),
    ImageRepeatAlpha(ImageRepeatAlphaShader<'a, 'b>),
    TransformedNearestPadImageAlpha(TransformedNearestImageAlphaShader<'a, 'b, PadFetch>),
    TransformedNearestRepeatImageAlpha(TransformedNearestImageAlphaShader<'a, 'b, RepeatFetch>),
    TransformedPadImageAlpha(TransformedImageAlphaShader<'a, 'b, PadFetch>),
    TransformedRepeatImageAlpha(TransformedImageAlphaShader<'a, 'b, RepeatFetch>),
    TransformedPadImage(TransformedImageShader<'a, 'b, PadFetch>),
    TransformedRepeatImage(TransformedImageShader<'a, 'b, RepeatFetch>),
    TransformedNearestPadImage(TransformedNearestImageShader<'a, 'b, PadFetch>),
    TransformedNearestRepeatImage(TransformedNearestImageShader<'a, 'b, RepeatFetch>),
    RadialGradient(RadialGradientShader),
    TwoCircleRadialGradient(TwoCircleRadialGradientShader),
    LinearGradient(LinearGradientShader),
    SweepGradient(SweepGradientShader),
}

// The idea here is to store a shader in shader_storage and then return
// a reference to it. The goal is to avoid a heap allocation but the end
// result is pretty ugly.
pub fn choose_shader<'a, 'b, 'c>(
    ti: &Transform,
    src: &'b Source<'c>,
    alpha: f32,
    shader_storage: &'a mut ShaderStorage<'b, 'c>,
) -> &'a dyn Shader {
    // XXX: clamp alpha
    let alpha = (alpha * 255. + 0.5) as u32;

    *shader_storage = match src {
        Source::Solid(c) => {
            let color = alpha_mul(c.to_u32(), alpha_to_alpha256(alpha));
            let s = SolidShader { color };
            ShaderStorage::Solid(s)
        }
        Source::Image(ref image, ExtendMode::Pad, filter, transform) => {
            if let Some(offset) = is_integer_transform(&ti.then(&transform)) {
                ShaderStorage::ImagePadAlpha(ImagePadAlphaShader::new(
                    image, offset.x, offset.y, alpha,
                ))
            } else {
                if alpha != 255 {
                    if *filter == FilterMode::Bilinear {
                        let s = TransformedImageAlphaShader::<PadFetch>::new(
                            image,
                            &ti.then(&transform),
                            alpha,
                        );
                        ShaderStorage::TransformedPadImageAlpha(s)
                    } else {
                        let s = TransformedNearestImageAlphaShader::<PadFetch>::new(
                            image,
                            &ti.then(&transform),
                            alpha,
                        );
                        ShaderStorage::TransformedNearestPadImageAlpha(s)
                    }
                } else {
                    if *filter == FilterMode::Bilinear {
                        let s =
                            TransformedImageShader::<PadFetch>::new(image, &ti.then(&transform));
                        ShaderStorage::TransformedPadImage(s)
                    } else {
                        let s = TransformedNearestImageShader::<PadFetch>::new(
                            image,
                            &ti.then(&transform),
                        );
                        ShaderStorage::TransformedNearestPadImage(s)
                    }
                }
            }
        }
        Source::Image(ref image, ExtendMode::Repeat, filter, transform) => {
            if let Some(offset) = is_integer_transform(&ti.then(&transform)) {
                ShaderStorage::ImageRepeatAlpha(ImageRepeatAlphaShader::new(
                    image, offset.x, offset.y, alpha,
                ))
            } else {
                if *filter == FilterMode::Bilinear {
                    if alpha != 255 {
                        let s = TransformedImageAlphaShader::<RepeatFetch>::new(
                            image,
                            &ti.then(&transform),
                            alpha,
                        );
                        ShaderStorage::TransformedRepeatImageAlpha(s)
                    } else {
                        let s =
                            TransformedImageShader::<RepeatFetch>::new(image, &ti.then(&transform));
                        ShaderStorage::TransformedRepeatImage(s)
                    }
                } else {
                    if alpha != 255 {
                        let s = TransformedNearestImageAlphaShader::<RepeatFetch>::new(
                            image,
                            &ti.then(&transform),
                            alpha,
                        );
                        ShaderStorage::TransformedNearestRepeatImageAlpha(s)
                    } else {
                        let s = TransformedNearestImageShader::<RepeatFetch>::new(
                            image,
                            &ti.then(&transform),
                        );
                        ShaderStorage::TransformedNearestRepeatImage(s)
                    }
                }
            }
        }
        Source::RadialGradient(ref gradient, spread, transform) => {
            let s = RadialGradientShader::new(gradient, &ti.then(&transform), *spread, alpha);
            ShaderStorage::RadialGradient(s)
        }
        Source::TwoCircleRadialGradient(ref gradient, spread, c1, r1, c2, r2, transform) => {
            let s = TwoCircleRadialGradientShader::new(
                gradient,
                &ti.then(&transform),
                *c1,
                *r1,
                *c2,
                *r2,
                *spread,
                alpha,
            );
            ShaderStorage::TwoCircleRadialGradient(s)
        }
        Source::SweepGradient(ref gradient, spread, start_angle, end_angle, transform) => {
            let s = SweepGradientShader::new(
                gradient,
                &ti.then(&transform),
                *start_angle,
                *end_angle,
                *spread,
                alpha,
            );
            ShaderStorage::SweepGradient(s)
        }
        Source::LinearGradient(ref gradient, spread, transform) => {
            let s = LinearGradientShader::new(gradient, &ti.then(&transform), *spread, alpha);
            ShaderStorage::LinearGradient(s)
        }
    };

    match shader_storage {
        ShaderStorage::None => unreachable!(),
        ShaderStorage::Solid(s) => s,
        ShaderStorage::ImagePadAlpha(s) => s,
        ShaderStorage::ImageRepeatAlpha(s) => s,
        ShaderStorage::TransformedNearestPadImageAlpha(s) => s,
        ShaderStorage::TransformedNearestRepeatImageAlpha(s) => s,
        ShaderStorage::TransformedPadImageAlpha(s) => s,
        ShaderStorage::TransformedRepeatImageAlpha(s) => s,
        ShaderStorage::TransformedPadImage(s) => s,
        ShaderStorage::TransformedRepeatImage(s) => s,
        ShaderStorage::TransformedNearestPadImage(s) => s,
        ShaderStorage::TransformedNearestRepeatImage(s) => s,
        ShaderStorage::RadialGradient(s) => s,
        ShaderStorage::TwoCircleRadialGradient(s) => s,
        ShaderStorage::SweepGradient(s) => s,
        ShaderStorage::LinearGradient(s) => s,
    }
}

pub enum ShaderBlitterStorage<'a> {
    None,
    ShaderBlendMaskBlitter(ShaderBlendMaskBlitter<'a>),
    ShaderClipBlendMaskBlitter(ShaderClipBlendMaskBlitter<'a>),
    ShaderMaskBlitter(ShaderMaskBlitter<'a>),
    ShaderClipMaskBlitter(ShaderClipMaskBlitter<'a>),
    ShaderBlendBlitter(ShaderBlendBlitter<'a>),
}

/*
pub struct SolidBlitter<'a> {
    color: u32,
    mask: &'a [u8],
    dest: &'a mut [u32],
    dest_stride: i32,
    mask_stride: i32,
}

impl<'a> Blitter for SolidBlitter<'a> {
    fn blit_span(&mut self, y: i32, x1: i32, x2: i32) {
        let dest_row = y * self.dest_stride;
        let mask_row = y * self.mask_stride;
        for i in x1..x2 {
            self.dest[(dest_row + i) as usize] = over_in(
                self.color,
                self.dest[(dest_row + i) as usize],
                self.mask[(mask_row + i) as usize] as u32,
            );
        }
    }
}
*/

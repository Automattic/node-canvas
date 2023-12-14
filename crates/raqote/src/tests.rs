#[cfg(test)]
mod tests {

    use crate::geom::intrect;
    use crate::*;
    const WHITE_SOURCE: Source = Source::Solid(SolidSource {
        r: 0xff,
        g: 0xff,
        b: 0xff,
        a: 0xff,
    });

    #[test]
    fn basic_rasterizer() {
        let mut dt = DrawTarget::new(2, 2);
        let mut pb = PathBuilder::new();
        pb.rect(1., 1., 1., 1.);
        dt.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![0, 0, 0, white][..])
    }

    #[test]
    fn implicit_close() {
        let mut dt = DrawTarget::new(2, 2);
        let mut pb = PathBuilder::new();
        pb.move_to(1., 1.);
        pb.line_to(2., 1.);
        pb.line_to(2., 2.);
        pb.line_to(1., 2.);
        dt.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![0, 0, 0, white][..])
    }

    #[test]
    fn offscreen_edges() {
        let mut dt = DrawTarget::new(2, 2);
        let mut pb = PathBuilder::new();
        pb.rect(1., 0., 8., 1.);
        dt.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![0, white, 0, 0][..])
    }

    #[test]
    fn clip_rect() {
        let mut dt = DrawTarget::new(2, 2);
        dt.push_clip_rect(intrect(1, 1, 2, 2));
        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 2., 2.);
        dt.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![0, 0, 0, white][..])
    }

    #[test]
    fn nested_clip_rect() {
        let mut dt = DrawTarget::new(2, 2);
        dt.push_clip_rect(intrect(0, 1, 2, 2));
        dt.push_clip_rect(intrect(1, 0, 2, 2));
        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 2., 2.);
        dt.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![0, 0, 0, white][..])
    }

    #[test]
    fn even_odd_rect() {
        let mut dt = DrawTarget::new(2, 2);
        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 2., 2.);
        pb.rect(0., 0., 2., 2.);
        pb.rect(1., 1., 2., 2.);
        let mut path = pb.finish();
        path.winding = Winding::EvenOdd;
        dt.fill(&path, &WHITE_SOURCE, &DrawOptions::new());
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![0, 0, 0, white][..])
    }

    #[test]
    fn clear() {
        let mut dt = DrawTarget::new(2, 2);
        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 2., 2.);
        let path = pb.finish();
        dt.fill(&path, &WHITE_SOURCE, &DrawOptions::new());
        dt.clear(SolidSource {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
        });
        assert_eq!(dt.get_data(), &vec![0, 0, 0, 0][..])
    }

    #[test]
    fn basic_push_layer() {
        let mut dt = DrawTarget::new(2, 2);
        let mut pb = PathBuilder::new();
        dt.push_clip_rect(intrect(1, 1, 2, 2));
        dt.push_layer(1.);
        pb.rect(1., 1., 1., 1.);
        dt.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        let white = 0xffffffff;
        dt.pop_layer();
        assert_eq!(dt.get_data(), &vec![0, 0, 0, white][..])
    }

    #[test]
    fn basic_draw_image() {
        let mut dt = DrawTarget::new(2, 2);
        let mut dt2 = DrawTarget::new(1, 1);

        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 1., 1.);
        dt2.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        let image = Image {
            width: 1,
            height: 1,
            data: dt2.get_data(),
        };
        dt.draw_image_at(1., 1., &image, &DrawOptions::default());
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![0, 0, 0, white][..])
    }

    #[test]
    fn draw_image_subset() {
        let mut dt = DrawTarget::new(2, 2);
        let mut dt2 = DrawTarget::new(3, 3);

        let mut pb = PathBuilder::new();
        pb.rect(1., 1., 1., 1.);
        dt2.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        let image = Image {
            width: 3,
            height: 3,
            data: dt2.get_data(),
        };
        dt.draw_image_at(0., 0., &image, &DrawOptions::default());
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![0, 0, 0, white][..])
    }

    #[test]
    fn repeating_draw_image() {
        let mut dt = DrawTarget::new(4, 1);
        let mut dt2 = DrawTarget::new(2, 1);

        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 1., 1.);
        dt2.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        let image = Image {
            width: 2,
            height: 1,
            data: dt2.get_data(),
        };
        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 4., 1.);
        let source = Source::Image(
            image,
            ExtendMode::Repeat,
            FilterMode::Bilinear,
            Transform::translation(0., 0.),
        );

        dt.fill(&pb.finish(), &source, &DrawOptions::default());
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![white, 0, white, 0][..])
    }

    #[test]
    fn stroke() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.rect(0.5, 0.5, 2., 2.);
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 1.,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
        let white = 0xffffffff;
        assert_eq!(
            dt.get_data(),
            &vec![white, white, white, white, 0, white, white, white, white][..]
        )
    }

    #[test]
    fn degenerate_stroke() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.move_to(0.5, 0.5);
        pb.line_to(2., 2.);
        pb.line_to(2., 2.);
        pb.line_to(4., 2.);
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 1.,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
    }

    #[test]
    fn degenerate_stroke2() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.move_to(2., 2.);
        pb.line_to(2., 3.);
        pb.line_to(2., 4.);
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 1.,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
    }

    #[test]
    fn zero_width_stroke() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.move_to(2., 2.);
        pb.line_to(200., 300.);
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 0.,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
    }

    #[test]
    fn negative_width_stroke() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.move_to(2., 2.);
        pb.line_to(200., 300.);
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: std::f32::MIN,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
    }

    #[test]
    fn tiny_negative_width_stroke() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.move_to(2., 2.);
        pb.line_to(200., 300.);
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: -core::f32::MIN_POSITIVE,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
    }

    #[test]
    fn dashing() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.move_to(40., 40.);
        pb.line_to(160., 40.);
        pb.line_to(160., 160.);
        pb.line_to(160., 160.);
        pb.close();
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 1.,
                dash_array: vec![10.0, 6.0, 4.0, 10.0, 6.0, 4.0],
                dash_offset: 15.0,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
    }

    #[test]
    fn dash_rect() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.rect(0.5, 0.5, 12., 12.);
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 1.,
                dash_array: vec![1., 1.],
                dash_offset: 0.5,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
        let white = 0xffffffff;
        assert_eq!(
            dt.get_data(),
            &vec![white, 0, white, 0, 0, 0, white, 0, 0][..]
        )
    }

    #[test]
    fn dash_with_negative_length_1() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.rect(0.5, 0.5, 12., 12.);
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 1.,
                dash_array: vec![-1.],
                dash_offset: 0.5,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
        // Must not loop.
    }

    #[test]
    fn dash_with_negative_length_2() {
        let mut dt = DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.rect(0.5, 0.5, 12., 12.);
        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 1.,
                dash_array: vec![5., -10.],
                dash_offset: 0.5,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
        // Must not loop.
    }

    #[test]
    fn draw_options_alpha() {
        let mut dt = DrawTarget::new(2, 2);
        let mut pb = PathBuilder::new();
        pb.rect(1., 1., 1., 1.);
        dt.fill(
            &pb.finish(),
            &WHITE_SOURCE,
            &DrawOptions {
                alpha: 0.,
                ..Default::default()
            },
        );
        assert_eq!(dt.get_data(), &vec![0, 0, 0, 0][..])
    }

    #[test]
    fn blend_zero() {
        let mut dt = DrawTarget::new(2, 2);

        dt.clear(SolidSource {
            r: 0xff,
            g: 0xff,
            b: 0xff,
            a: 0xff,
        });

        let source = Source::Solid(SolidSource {
            r: 0x00,
            g: 0x00,
            b: 0x00,
            a: 0xff,
        });

        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 1., 1.);
        let path = pb.finish();
        dt.fill(&path, &source, &DrawOptions::default());
        let white = 0xffffffff;
        let black = 0xff000000;

        assert_eq!(dt.get_data(), &vec![black, white, white, white][..])
    }

    #[test]
    fn two_circle_radial_gradient() {
        let mut dt = DrawTarget::new(2, 2);

        let gradient = Source::new_two_circle_radial_gradient(
            Gradient {
                stops: vec![
                    GradientStop {
                        position: 0.0,
                        color: Color::new(0xff, 00, 00, 00),
                    },
                    GradientStop {
                        position: 1.0,
                        color: Color::new(0xff, 0xff, 0xff, 0xff),
                    },
                ],
            },
            Point::new(-8., -8.),
            0.0,
            Point::new(-8., -8.),
            0.5,
            Spread::Pad,
        );

        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 2., 2.);
        let path = pb.finish();
        dt.fill(&path, &gradient, &DrawOptions::default());
        let white = 0xffffffff;

        assert_eq!(dt.get_data(), &vec![white, white, white, white][..])
    }

    #[test]
    fn two_circle_radial_gradient_boundary() {
        // make sure the gradient doesn't draw anything for r < 0 circles
        let mut dt = DrawTarget::new(2, 2);
        let gradient = Gradient {
            stops: vec![
                GradientStop {
                    position: 0.0,
                    color: Color::new(0xff, 0xff, 0, 0xff),
                },
                GradientStop {
                    position: 1.0,
                    color: Color::new(0xff, 0x0, 0, 0xff),
                },
            ],
        };

        let src = Source::new_two_circle_radial_gradient(
            gradient.clone(),
            Point::new(150., 25.),
            50.,
            Point::new(200., 25.),
            100.,
            Spread::Pad,
        );

        dt.fill_rect(0., 0., 2., 2., &src, &DrawOptions::default());
        assert_eq!(dt.get_data(), &vec![0, 0, 0, 0][..]);

        let src = Source::new_two_circle_radial_gradient(
            gradient,
            Point::new(100., 25.),
            50.,
            Point::new(200., 25.),
            100.,
            Spread::Pad,
        );

        dt.fill_rect(0., 0., 2., 2., &src, &DrawOptions::default());
        assert_eq!(dt.get_data(), &vec![0, 0, 0, 0][..])
    }

    #[test]
    fn get_mut_data() {
        let mut dt = DrawTarget::new(1, 1);

        let data = dt.get_data_u8_mut();
        data[0] = 0xff;
        data[1] = 0xff;
        data[2] = 0xff;
        data[3] = 0xff;

        let white = 0xffffffff;

        assert_eq!(dt.get_data(), &vec![white][..])
    }

    #[test]
    fn draw_options_aliased() {
        let mut dt = DrawTarget::new(2, 2);
        let mut pb = PathBuilder::new();
        pb.rect(0.5, 0.5, 1., 1.);
        dt.fill(
            &pb.finish(),
            &WHITE_SOURCE,
            &DrawOptions {
                antialias: AntialiasMode::None,
                ..Default::default()
            },
        );
        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![0, 0, white, 0][..])
    }

    #[test]
    fn draw_options_aliased_bounds() {
        let mut dt = DrawTarget::new(2, 4);
        let mut pb = PathBuilder::new();
        pb.rect(1., 3., 1., 1.);
        dt.fill(
            &pb.finish(),
            &WHITE_SOURCE,
            &DrawOptions {
                antialias: AntialiasMode::None,
                ..Default::default()
            },
        );
    }

    #[test]
    fn copy_surface() {
        let mut dest = DrawTarget::new(2, 2);
        let mut src = DrawTarget::new(2, 2);

        let white = 0xffffffff;
        let red = 0xffff0000;
        let green = 0xff00ff00;
        let blue = 0xff0000ff;

        let data = src.get_data_mut();
        data[0] = white;
        data[1] = red;
        data[2] = green;
        data[3] = blue;

        dest.copy_surface(&src, intrect(0, 0, 2, 2), IntPoint::new(-1, -1));
        assert_eq!(dest.get_data(), &vec![blue, 0, 0, 0][..]);
        dest.copy_surface(&src, intrect(0, 0, 2, 2), IntPoint::new(1, -1));
        assert_eq!(dest.get_data(), &vec![blue, green, 0, 0][..]);
        dest.copy_surface(&src, intrect(0, 0, 2, 2), IntPoint::new(-1, 1));
        assert_eq!(dest.get_data(), &vec![blue, green, red, 0][..]);
        dest.copy_surface(&src, intrect(0, 0, 2, 2), IntPoint::new(1, 1));
        assert_eq!(dest.get_data(), &vec![blue, green, red, white][..]);
    }

    #[test]
    fn path_contains_point() {
        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 2., 2.);
        let rect = pb.finish();

        assert!(rect.contains_point(0.1, 1., 1.));
        assert!(!rect.contains_point(0.1, 4., 4.));
        assert!(rect.contains_point(0.1, 0., 1.));

        let mut pb = PathBuilder::new();
        pb.move_to(0., 0.);
        pb.line_to(0., 1.);
        pb.line_to(1., 1.);
        pb.close();
        let tri = pb.finish();

        assert!(tri.contains_point(0.1, 0.5, 0.5));
        assert!(!tri.contains_point(0.1, 0.6, 0.5));
        assert!(tri.contains_point(0.1, 0.4, 0.5));
    }

    #[test]
    fn push_clip() {
        let mut dest = DrawTarget::new(2, 2);

        let mut pb = PathBuilder::new();
        pb.rect(1., 1., 1., 1.);
        let rect = pb.finish();

        dest.push_clip(&rect);

        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 1., 1.);
        let rect = pb.finish();

        dest.push_clip(&rect);
    }

    #[test]
    fn empty_lineto_fill() {
        let mut dt = DrawTarget::new(2, 2);

        let mut pb = PathBuilder::new();
        pb.line_to(0., 2.);
        pb.line_to(2., 2.);
        pb.line_to(2., 0.);
        dt.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
        assert_eq!(dt.get_data()[0], 0)
    }

    #[test]
    fn empty_lineto_stroke() {
        let mut dt = DrawTarget::new(2, 2);

        let mut pb = PathBuilder::new();
        pb.line_to(0., 2.);
        let path = pb.finish();
        dt.stroke(
            &path,
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 2.,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
        assert_eq!(dt.get_data(), &vec![0, 0, 0, 0][..]);

        dt.stroke(
            &path,
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 2.,
                dash_array: vec![2., 2.],
                dash_offset: 0.,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
        assert_eq!(dt.get_data(), &vec![0, 0, 0, 0][..]);
    }

    #[test]
    fn clip_rect_composite() {
        let mut dest = DrawTarget::new(2, 2);

        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 2., 2.);
        let rect = pb.finish();

        let fill = Source::Solid(SolidSource {
            r: 255,
            g: 0,
            b: 0,
            a: 255,
        });
        dest.fill(&rect, &fill, &DrawOptions::new());
        dest.push_clip(&rect);

        let pixels = dest.get_data();
        // expected a red pixel
        let expected = 255 << 24 | 255 << 16 | 0 << 8 | 0;
        assert_eq!(pixels[0], expected);

        let fill = Source::Solid(SolidSource {
            r: 0,
            g: 255,
            b: 0,
            a: 255,
        });
        dest.fill(&rect, &fill, &DrawOptions::new());
        let pixels = dest.get_data();
        // expected a green pixel
        let expected = 255 << 24 | 0 << 16 | 255 << 8 | 0;
        assert_eq!(pixels[0], expected);
    }

    #[test]
    fn draw_image_xor() {
        let mut target = DrawTarget::new(1, 1);
        let mut pb = PathBuilder::new();
        pb.rect(0., 0., 1., 1.);
        let rect = pb.finish();
        let mut options = DrawOptions::new();
        options.blend_mode = BlendMode::Src;
        target.fill(
            &rect,
            &Source::Solid(SolidSource::from_unpremultiplied_argb(128, 0, 255, 255)),
            &options,
        );

        options.blend_mode = BlendMode::Xor;
        target.fill(
            &rect,
            &Source::Solid(SolidSource::from_unpremultiplied_argb(0xbf, 255, 255, 0)),
            &options,
        );
    }

    #[test]
    fn arc_contains() {
        let mut pb = PathBuilder::new();
        pb.arc(50., 25., 10., 0., std::f32::consts::PI);
        let path = pb.finish();
        assert!(!path.contains_point(0.1, 50., 10.));
        assert!(!path.contains_point(0.1, 50., 20.));
        assert!(path.contains_point(0.1, 50., 30.));
        assert!(!path.contains_point(0.1, 50., 40.));
        assert!(!path.contains_point(0.1, 30., 20.));
        assert!(!path.contains_point(0.1, 70., 20.));
        assert!(!path.contains_point(0.1, 30., 30.));
        assert!(!path.contains_point(0.1, 70., 30.));
    }

    #[test]
    fn new_linear_gradient_zerosize() {
        let source = Source::new_linear_gradient(
            Gradient { stops: Vec::new() },
            Point::new(42., 42.),
            Point::new(42., 42.),
            Spread::Pad,
        );

        match source {
            Source::LinearGradient(_, _, transform) => {
                assert_eq!(transform.m11, 0.);
                assert_eq!(transform.m12, 0.);
                assert_eq!(transform.m21, 0.);
                assert_eq!(transform.m22, 0.);
                assert_eq!(transform.m31, 0.);
                assert_eq!(transform.m32, 0.);
            }
            _ => panic!("dead end"),
        };
    }

    #[test]
    fn blend_surface_with_negative_offset() {
        let mut dt1 = crate::DrawTarget::new(3, 3);
        let dt2 = crate::DrawTarget::new(3, 3);
        dt1.blend_surface_with_alpha(
            &dt2,
            crate::IntRect::new(crate::IntPoint::new(-1, -1), crate::IntPoint::new(2, 2)),
            crate::IntPoint::new(2, 2),
            1.0,
        );
    }

    #[test]
    fn close_sets_current_point() {
        let mut dt = crate::DrawTarget::new(3, 3);
        let mut pb = PathBuilder::new();
        pb.rect(10., 10., 100., 100.);
        pb.line_to(-10., -10.);
        let path = pb.finish();
        dt.stroke(
            &path,
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 5.,
                ..Default::default()
            },
            &DrawOptions::new(),
        );
        let white = 0xffffffff;
        assert_eq!(
            dt.get_data(),
            &vec![white, white, white, white, white, white, white, white, white][..]
        );

        // make sure we get the same behaviour when dashing
        let mut dt = crate::DrawTarget::new(3, 3);
        dt.stroke(
            &path,
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 5.,
                dash_array: vec![1000., 10.],
                ..Default::default()
            },
            &DrawOptions::new(),
        );
        let white = 0xffffffff;
        assert_eq!(
            dt.get_data(),
            &vec![white, white, white, white, white, white, white, white, white][..]
        );
    }

    #[test]
    fn close_clears_start_point() {
        let mut dt = DrawTarget::new(4, 4);

        // This path is positioned just outside of the draw
        // target so that when it's stroked we can ensure
        // that none of the stroke leaks in
        let mut pb = PathBuilder::new();
        pb.move_to(14.0, 0.0);
        pb.line_to(104.0, 30.0);
        pb.line_to(14.0, 70.0);
        pb.close();

        let style = StrokeStyle {
            width: 20.0,
            cap: LineCap::Square,
            join: LineJoin::Bevel,
            ..StrokeStyle::default()
        };

        dt.stroke(&pb.finish(), &WHITE_SOURCE, &style, &DrawOptions::new());

        for i in dt.get_data() {
            assert_eq!(*i, 0);
        }
    }

    #[test]
    fn negative_repeat() {
        let mut dt = DrawTarget::new(2, 2);
        let options = DrawOptions::new();

        let img = Image {
            width: 2,
            height: 2,
            data: &vec![0xffff0000; 2 * 2],
        };

        let identity = Transform::identity();
        let img_src = Source::Image(img, ExtendMode::Repeat, FilterMode::Nearest, identity);
        dt.set_transform(&dt.get_transform().pre_translate(euclid::vec2(0., 1.)));
        dt.fill_rect(0., -1., 100., 50., &img_src, &options);
    }

    #[test]
    fn zero_sized_draw_target() {
        let mut dt = DrawTarget::new(0, 0);
        let mut pb = PathBuilder::new();
        pb.line_to(0.5, 0.5);
        pb.line_to(2.0, -2.0);
        pb.line_to(2.0, 0.5);
        dt.fill(&pb.finish(), &WHITE_SOURCE, &DrawOptions::new());
    }

    #[test]
    fn dash_subpath_restart() {
        let mut dt = DrawTarget::new(2, 2);
        let mut pb = PathBuilder::new();

        // move to some arbitrary place
        pb.move_to(40., 40.);
        pb.line_to(60., 40.);
        // the dash should still be off

        // Start a new subpath. This should reset the dash state so that we
        // cover the entire draw target with the dash
        pb.move_to(-0.5, 1.);
        pb.line_to(3., 1.);

        dt.stroke(
            &pb.finish(),
            &WHITE_SOURCE,
            &StrokeStyle {
                width: 2.,
                dash_array: vec![1.0, 14.0, 3.0, 80.],
                dash_offset: 15.0,
                ..Default::default()
            },
            &DrawOptions::new(),
        );

        let white = 0xffffffff;
        assert_eq!(dt.get_data(), &vec![white, white, white, white][..]);
    }

    #[test]
    fn nearest_offset() {
        let white = 0xffffffff;
        let checkerboard = vec![0xff000000, white, white, 0xff000000];
        let (width, height) = (2, 2);

        let mut dt = DrawTarget::new(width, height);
        let image = Image {
            width,
            height,
            data: &checkerboard,
        };
        dt.set_transform(&Transform::translation(-299., -299.));
        let source = Source::Image(
            image,
            ExtendMode::Pad,
            FilterMode::Nearest,
            Transform::identity().then_scale(width as f32 / 600., height as f32 / 600.),
        );

        // draw a checkerboard scaled way up and make sure the origin stays in the center
        dt.fill_rect(0., 0., 600., 600., &source, &DrawOptions::new());

        assert_eq!(dt.get_data(), &checkerboard[..]);
    }
}

use std::error::Error;

use super::Status;
use crate::{read::ByteReader, E, EU, EX};

pub const MAX_IMAGE_SIZE: i32 = 10000;

#[derive(Debug, Clone, Default)]
pub struct BmpParser<'a> {
    status: Status,
    data: ByteReader<'a>,
    ptr: u32,
    length: usize,
    width: i32,
    height: i32,
    image_data: Vec<u8>,
    error: Option<String>,
    op: Option<String>,
}

impl<'a> BmpParser<'a> {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn parse(
        &mut self,
        buf: &'a [u8],
        buf_size: usize,
        format: Option<Vec<u8>>,
    ) -> Result<(), Box<dyn Error>> {
        assert!(self.status == Status::Empty);

        self.data = ByteReader::new(buf);
        self.length = buf_size;

        // Start parsing file header
        self.set_op("file header");

        // File header signature
        let fh_sig = self.data.read_str(2, None)?;
        let temp = "file header signature";

        EU!(self, fh_sig == "BA", format!("{} \"BA\"", temp));
        EU!(self, fh_sig == "CI", format!("{} \"CI\"", temp));
        EU!(self, fh_sig == "CP", format!("{} \"CP\"", temp));
        EU!(self, fh_sig == "IC", format!("{} \"IC\"", temp));
        EU!(self, fh_sig == "PT", format!("{} \"PT\"", temp));
        EU!(self, fh_sig == "BM", temp);

        // Length of the file should not be larger than `self.length`
        E!(
            self,
            self.data.read_u32()? > self.length as u32,
            "inconsistent file size"
        );

        // Skip unused values
        self.data.skip(4)?;

        // Offset where the pixel array (bitmap data) can be found
        let imgd_offset = self.data.read_u32()?;

        // Start parsing DIB header
        self.set_op("DIB header");

        // Prepare some variables in case they are needed
        let mut compr = 0;
        let mut red_shift = 0;
        let mut red_mask = 0;
        let mut red_multp: f32 = 0.0;
        let mut green_shift = 0;
        let mut green_mask = 0;
        let mut green_multp: f32 = 0.0;
        let mut blue_shift = 0;
        let mut blue_mask = 0;
        let mut blue_multp: f32 = 0.0;
        let mut alpha_shift = 0;
        let mut alpha_mask = 0;
        let mut alpha_multp: f32 = 0.0;

        // Type of the DIB (device-independent bitmap) header
        // is determined by its size. Most BMP files use BITMAPINFOHEADER.
        let dib_size = self.data.read_u32()?;
        let mut temp = "DIB header";

        EU!(
            self,
            dib_size == 64,
            format!("{} \"OS22XBITMAPHEADER\"", temp)
        );
        EU!(
            self,
            dib_size == 16,
            format!("{} \"OS22XBITMAPHEADER\"", temp)
        );

        let info_header: u32 = match dib_size {
            40 => 1,
            52 => 2,
            56 => 3,
            108 => 4,
            124 => 5,
            _ => 0,
        };

        // BITMAPCOREHEADER, BITMAP*INFOHEADER, BITMAP*HEADER
        let is_dib_valid = dib_size == 12 || info_header > 0;

        EX!(self, !is_dib_valid, temp);

        // Image width
        self.width = match dib_size {
            12 => self.data.read_u16()? as i32,
            _ => self.data.read_i32()?,
        };

        E!(self, self.width == 0, "image width is 0");
        E!(self, self.width < 0, "negative image width");
        E!(self, self.width > MAX_IMAGE_SIZE, "too large image width");

        // Image height
        self.height = match dib_size {
            12 => self.data.read_u16()? as i32,
            _ => self.data.read_i32()?,
        };

        E!(self, self.height == 0, "image height is 0");
        E!(self, self.height > MAX_IMAGE_SIZE, "too large image height");

        let is_height_negative = self.height < 0;

        if is_height_negative {
            self.height = -self.height;
        }

        // Number of color planes (must be 1)
        E!(
            self,
            self.data.read_u16()? != 1,
            "number of color planes must be 1"
        );

        // Bits per pixel (color depth)
        let bpp = self.data.read_u16()? as i32;
        let is_bpp_valid = bpp == 1 || bpp == 4 || bpp == 8 || bpp == 16 || bpp == 24 || bpp == 32;

        EU!(self, !is_bpp_valid, "color depth");

        // Calculate image data size and padding
        let expected_imgd_size = (((self.width * bpp + 31) >> 5) << 2) * self.height;
        let row_padding = (-self.width * bpp & 31) >> 3;
        let mut imgd_size = 0;

        // Color palette data
        let mut palette_start: Option<u8> = None;
        let mut pal_col_num = 0;

        if info_header > 0 {
            // Compression type
            compr = self.data.read_u32()?;
            temp = "compression type";

            EU!(self, compr == 1, format!("{} \"BI_RLE8\"", temp));
            EU!(self, compr == 2, format!("{} \"BI_RLE4\"", temp));
            EU!(self, compr == 4, format!("{} \"BI_JPEG\"", temp));
            EU!(self, compr == 5, format!("{} \"BI_PNG\"", temp));
            EU!(self, compr == 6, format!("{} \"BI_ALPHABITFIELDS\"", temp));
            EU!(self, compr == 11, format!("{} \"BI_CMYK\"", temp));
            EU!(self, compr == 12, format!("{} \"BI_CMYKRLE8\"", temp));
            EU!(self, compr == 13, format!("{} \"BI_CMYKRLE4\"", temp));

            // BI_RGB and BI_BITFIELDS
            let is_compr_valid = compr == 0 || compr == 3;
            EX!(self, !is_compr_valid, temp);

            // Ensure that BI_BITFIELDS appears only with 16-bit or 32-bit color
            E!(
                self,
                compr == 3 && !(bpp == 16 || bpp == 32),
                "compression BI_BITFIELDS can be used only with 16-bit and 32-bit color depth"
            );

            // Size of the image data
            imgd_size = self.data.read_u32()? as i32;

            // Horizontal and vertical resolution (ignored)
            self.data.skip(8)?;

            // Number of colors in the palette or 0 if no palette is present
            pal_col_num = self.data.read_u32()?;
            EU!(
                self,
                pal_col_num > 0 && bpp > 8,
                "color palette and bit depth combination"
            );

            if pal_col_num > 0 {
                palette_start = Some((self.data.len() + dib_size as usize + 14) as u8);
            }

            // Number of important colors used or 0 if all colors are important (generally ignored)
            self.data.skip(4)?;

            if info_header >= 2 {
                // If BI_BITFIELDS are used, calculate masks, otherwise ignore them
                if compr == 3 {
                    self.calc_mask_shift(&mut red_shift, &mut red_mask, &mut red_multp)?;
                    self.calc_mask_shift(&mut green_shift, &mut green_mask, &mut green_multp)?;
                    self.calc_mask_shift(&mut blue_shift, &mut blue_mask, &mut blue_multp)?;

                    if info_header >= 3 {
                        self.calc_mask_shift(&mut alpha_shift, &mut alpha_mask, &mut alpha_multp)?;
                    }

                    if self.status == Status::Error {
                        return Err("Status is error!".into());
                    }
                } else {
                    self.data.skip(16)?;
                }

                // Ensure that the color space is LCS_WINDOWS_COLOR_SPACE or sRGB
                if info_header >= 4 && pal_col_num <= 0 {
                    let col_space = self.data.read_str(4, Some(true))?;

                    EU!(
                        self,
                        col_space != "Win " && col_space != "sRGB",
                        format!("color space \"{}\"", col_space)
                    );
                }
            }
        }

        // Skip to the image data (there may be other chunks between, but they are optional)
        E!(
            self,
            self.ptr - self.data.len() as u32 > imgd_offset,
            "image data overlaps with another structure"
        );
        self.ptr = self.data.len() as u32 + imgd_offset;

        // Start parsing image data
        self.set_op("image data");

        if imgd_size <= 0 {
            // Value 0 is allowed only for BI_RGB compression type
            E!(self, compr != 0, "missing image data size");
            imgd_size = expected_imgd_size;
        } else {
            E!(
                self,
                imgd_size < expected_imgd_size,
                "invalid image data size"
            );
        }

        // Ensure that all image data is present
        E!(
            self,
            self.ptr as i32 - self.data.len() as i32 + imgd_size > self.length as i32,
            "not enough image data"
        );

        // Direction of reading rows
        let mut y_start = self.height - 1;
        let mut y_end = -1;

        let dy = match is_height_negative {
            true => 1,
            false => -1,
        };

        // In case of negative height, read rows backward
        if is_height_negative {
            y_start = 0;
            y_end = self.height;
        }

        // Allocate output image data array
        let buff_len = self.width * self.height << 2;
        let mut imgd = Vec::with_capacity(buff_len as usize);

        // Prepare color values
        let color = vec![0.0, 0.0, 0.0, 0.0];
        let mut red = color[0];
        let mut green = color[1];
        let mut blue = color[2];
        let mut alpha = color[3];

        // Check if pre-multiplied alpha is used
        let premul = match format.clone() {
            Some(data) => data[4],
            None => 0,
        };

        // Main loop
        let mut y = y_start;

        while y != y_end {
            // Use in-byte offset for bpp < 8
            let mut col_offset = 0;
            let mut cval;
            let mut val;
            let mut x = 0;

            while x != self.width {
                // Index in the output image data
                let i = (x + y * self.width) << 2;

                match compr {
                    0 => {
                        // BI_RGB
                        match bpp {
                            1 => {
                                if col_offset > 0 {
                                    self.ptr -= 1;
                                }

                                cval = (self.data.read_u8()? >> (7 - col_offset)) & 1;

                                if pal_col_num > 0 {
                                    let entry = (palette_start.unwrap() + (cval << 2)) as usize;

                                    blue = self.data.read_u8_at(entry)? as f32;
                                    green = self.data.read_u8_at(entry + 1)? as f32;
                                    red = self.data.read_u8_at(entry + 2)? as f32;

                                    if self.status == Status::Error {
                                        return Err("Status is error!".into());
                                    }
                                } else {
                                    if cval > 0 {
                                        red = 255.0;
                                        green = 255.0;
                                        blue = 255.0;
                                    } else {
                                        red = 0.0;
                                        green = 0.0;
                                        blue = 0.0;
                                    }
                                }

                                alpha = 255.0;
                                col_offset = (col_offset + 1) & 7;
                            }

                            4 => {
                                if col_offset > 0 {
                                    self.ptr -= 1;
                                }

                                cval = (self.data.read_u8()? >> (4 - col_offset)) & 15;

                                if pal_col_num > 0 {
                                    let entry = (palette_start.unwrap() + (cval << 2)) as usize;

                                    blue = self.data.read_u8_at(entry)? as f32;
                                    green = self.data.read_u8_at(entry + 1)? as f32;
                                    red = self.data.read_u8_at(entry + 2)? as f32;

                                    if self.status == Status::Error {
                                        return Err("Status is error!".into());
                                    }
                                } else {
                                    red = (cval << 4) as f32;
                                    green = red;
                                    blue = green;
                                }

                                alpha = 255.0;
                                col_offset = (col_offset + 4) & 7;
                            }

                            8 => {
                                cval = self.data.read_u8()?;

                                if pal_col_num > 0 {
                                    let entry = (palette_start.unwrap() + (cval << 2)) as usize;

                                    blue = self.data.read_u8_at(entry)? as f32;
                                    green = self.data.read_u8_at(entry + 1)? as f32;
                                    red = self.data.read_u8_at(entry + 2)? as f32;

                                    if self.status == Status::Error {
                                        return Err("Status is error!".into());
                                    }
                                } else {
                                    red = cval as f32;
                                    green = cval as f32;
                                    blue = cval as f32;
                                }

                                alpha = 255.0;
                            }

                            16 => {
                                // RGB555
                                val = self.data.read_u8()?;
                                val |= self.data.read_u8()? << 8;

                                red = ((val >> 10) << 3) as f32;
                                green = ((val >> 5) << 3) as f32;
                                blue = (val << 3) as f32;
                                alpha = 255.0;
                            }

                            24 => {
                                blue = self.data.read_u8()? as f32;
                                green = self.data.read_u8()? as f32;
                                red = self.data.read_u8()? as f32;
                                alpha = 255.0;
                            }

                            32 => {
                                blue = self.data.read_u8()? as f32;
                                green = self.data.read_u8()? as f32;
                                red = self.data.read_u8()? as f32;

                                if info_header >= 3 {
                                    alpha = self.data.read_u8()? as f32;
                                } else {
                                    alpha = 255.0;
                                    self.data.skip(1)?;
                                }
                            }

                            _ => {}
                        }
                    }

                    3 => {
                        // BI_BITFIELDS
                        let col = match bpp {
                            16 => self.data.read_u16()? as u32,
                            _ => self.data.read_u32()?,
                        };

                        red = ((col >> red_shift) & red_mask) as f32 * red_multp + 0.5;
                        green = ((col >> green_shift) & green_mask) as f32 * green_multp + 0.5;
                        blue = ((col >> blue_shift) & blue_mask) as f32 * blue_multp + 0.5;

                        if alpha_mask > 0 {
                            alpha = ((col >> alpha_shift) & alpha_mask) as f32 * alpha_multp + 0.5;
                        } else {
                            alpha = 255.0;
                        }
                    }

                    _ => {}
                }

                // Pixel format:
                //  red,
                //  green,
                //  blue,
                //  alpha,
                //  is alpha pre-multiplied
                // Default is [0, 1, 2, 3, 0]

                if premul > 0 && alpha != 255.0 {
                    let a = alpha as f32 / 255.0;

                    red = (red * a + 0.5) as f32;
                    green = (green * a + 0.5) as f32;
                    blue = (blue * a + 0.5) as f32;
                }

                if format.clone().is_some() {
                    let idx = i as usize;
                    let format = format.clone().unwrap();

                    imgd[idx] = color[format[0] as usize];
                    imgd[idx + 1] = color[format[1] as usize];
                    imgd[idx + 2] = color[format[2] as usize];
                    imgd[idx + 3] = color[format[3] as usize];
                } else {
                    let idx = i as usize;

                    imgd[idx] = red;
                    imgd[idx + 1] = green;
                    imgd[idx + 2] = blue;
                    imgd[idx + 3] = alpha;
                }

                x += 1;
            }

            // Skip unused bytes in the current row
            self.data.skip(row_padding as usize)?;

            y += dy;
        }

        if self.status == Status::Error {
            return Err("Status is error!".into());
        }

        self.status = Status::Ok;

        Ok(())
    }

    pub fn clear_image_data(&mut self) {
        self.image_data = Vec::new();
    }

    pub fn get_width(&self) -> i32 {
        self.width
    }

    pub fn get_height(&self) -> i32 {
        self.height
    }

    pub fn get_image_data(&self) -> &[u8] {
        self.image_data.as_slice()
    }

    pub fn get_status(&self) -> Status {
        self.status
    }

    pub fn get_error_message(&self) -> String {
        format!("Error while processing {:?} - {:?}", self.op, self.error)
    }

    pub fn get_raw_error(&self) -> Option<String> {
        self.error.clone()
    }

    fn calc_mask_shift(
        &mut self,
        shift: &mut u32,
        mask: &mut u32,
        multp: &mut f32,
    ) -> Result<(), Box<dyn Error>> {
        *mask = self.data.read_u32()?;
        *shift = 0;

        if *mask == 0 {
            return Ok(());
        }

        while (*mask & 1) > 0 {
            *mask >>= 1;
            *shift += 1;
        }

        E!(self, (*mask & (*mask + 1)) > 0, "invalid color mask");

        *multp = 255.0 / *mask as f32;

        Ok(())
    }

    fn set_op(&mut self, val: &str) {
        if self.status == Status::Empty {
            return;
        }

        self.op = Some(String::from(val));
    }

    fn set_error_unsupported(&mut self, msg: String) {
        self.set_error(format!("unsupported {}", msg));
    }

    fn set_error_unknown(&mut self, msg: String) {
        self.set_error(format!("unknown {}", msg));
    }

    fn set_error(&mut self, msg: String) {
        if self.status == Status::Empty {
            return;
        }

        self.error = Some(msg);
        self.status = Status::Error;
    }
}

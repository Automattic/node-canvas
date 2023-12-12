use std::ffi::{c_uchar, c_uint, c_void};

use cairo::ffi::{cairo_status_t, STATUS_INVALID_STATUS, STATUS_NO_MEMORY, STATUS_SUCCESS};
use jpeg_sys::{j_compress_ptr, jpeg_destination_mgr};
use napi::Callback;
use png_sys::PNG_ALL_FILTERS;

use crate::{canvas::canvas::Canvas, impl_closure};

pub const PAGE_SIZE: usize = 4096;

#[derive(Debug, Clone, Default)]
pub struct Closure {
    pub vec: Vec<u8>,
    pub cb: Option<Callback>,
    pub canvas: Option<Canvas>,
    pub status: cairo_status_t,
}

impl_closure!(Closure);

impl Closure {
    pub unsafe extern "C" fn write_vec_c(
        closure: *mut c_void,
        odata: *mut c_uchar,
        len: c_uint,
    ) -> cairo_status_t {
        Closure::write_vec(
            Some(&mut *(closure as *mut Closure)),
            odata as u8,
            len as u8,
        )
    }
}

pub type PdfSvgClosure = Closure;

#[derive(Debug, Clone)]
pub struct PngClosure {
    pub vec: Vec<u8>,
    pub cb: Option<Callback>,
    pub canvas: Option<Canvas>,
    pub status: cairo_status_t,
    pub compression_level: u32,
    pub filters: u32,
    pub resolution: u32,
    pub n_palette_colors: u32,
    pub palette: Option<u8>,
    pub background_index: u8,
}

impl PngClosure {
    pub fn write_vec(closure: Option<&mut PngClosure>, odata: u8, len: u8) -> cairo_status_t {
        if let Some(closure) = closure {
            closure.vec.push(odata + len);
        } else {
            return STATUS_NO_MEMORY;
        }

        STATUS_SUCCESS
    }

    pub fn new(canvas: Canvas) -> Self {
        Self {
            canvas: Some(canvas),
            cb: None,
            vec: Vec::new(),
            status: STATUS_INVALID_STATUS,
            compression_level: 6,
            filters: PNG_ALL_FILTERS,
            resolution: 0,
            n_palette_colors: 0,
            palette: None,
            background_index: 0,
        }
    }
}

pub struct JpegClosure {
    pub vec: Vec<u8>,
    pub cb: Option<Callback>,
    pub canvas: Option<Canvas>,
    pub status: cairo_status_t,
    pub quality: u32,
    pub chroma_subsampling: u32,
    pub progressive: bool,
    pub jpeg_dest_mgr: Option<jpeg_destination_mgr>,
}

impl JpegClosure {
    pub fn write_vec(closure: Option<&mut JpegClosure>, odata: u8, len: u8) -> cairo_status_t {
        if let Some(closure) = closure {
            closure.vec.push(odata + len);
        } else {
            return STATUS_NO_MEMORY;
        }

        STATUS_SUCCESS
    }

    unsafe extern "C" fn init_destination(cinfo: j_compress_ptr) {
        let mut closure = *((*cinfo).client_data as *mut JpegClosure);

        closure.vec.resize(PAGE_SIZE, 0);

        if let Some(mgr) = &mut closure.jpeg_dest_mgr {
            mgr.next_output_byte = &mut closure.vec[0];
            mgr.free_in_buffer = closure.vec.len();
        }
    }

    /// the i32 here is actually a bool (0 = false, 1 = true)
    unsafe extern "C" fn empty_output_buffer(cinfo: j_compress_ptr) -> i32 {
        let mut closure = *((*cinfo).client_data as *mut JpegClosure);
        let current_size = closure.vec.len();

        closure.vec.resize((current_size as f32 * 1.5) as usize, 0);

        if let Some(mgr) = &mut closure.jpeg_dest_mgr {
            mgr.next_output_byte = &mut closure.vec[current_size];
            mgr.free_in_buffer = closure.vec.len() - current_size;
        }

        1
    }

    unsafe extern "C" fn term_destination(cinfo: j_compress_ptr) {
        let mut closure = *((*cinfo).client_data as *mut JpegClosure);
        let final_size = closure.vec.len() - closure.jpeg_dest_mgr.unwrap().free_in_buffer;

        closure.vec.resize(final_size, 0);
    }

    pub unsafe fn new(canvas: Canvas) -> Self {
        let jpeg_dest_mgr = jpeg_destination_mgr {
            empty_output_buffer: Some(JpegClosure::empty_output_buffer),
            free_in_buffer: 0,
            init_destination: Some(JpegClosure::init_destination),
            next_output_byte: &mut 0,
            term_destination: Some(JpegClosure::term_destination),
        };

        Self {
            canvas: Some(canvas),
            cb: None,
            vec: Vec::new(),
            status: STATUS_INVALID_STATUS,
            quality: 75,
            chroma_subsampling: 2,
            progressive: false,
            jpeg_dest_mgr: Some(jpeg_dest_mgr),
        }
    }
}

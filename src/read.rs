use std::{error::Error, io};

use byteorder::{LittleEndian, ReadBytesExt};

#[derive(Debug, Clone, Default)]
pub struct ByteReader<'a> {
    pub data: &'a [u8],
}

impl<'a> ByteReader<'a> {
    pub fn new(data: &'a [u8]) -> Self {
        Self { data }
    }

    pub fn read_i8(&mut self) -> Result<i8, io::Error> {
        self.data.read_i8()
    }

    pub fn read_u8(&mut self) -> Result<u8, io::Error> {
        self.data.read_u8()
    }

    pub fn read_i16(&mut self) -> Result<i16, io::Error> {
        self.data.read_i16::<LittleEndian>()
    }

    pub fn read_u16(&mut self) -> Result<u16, io::Error> {
        self.data.read_u16::<LittleEndian>()
    }

    pub fn read_i32(&mut self) -> Result<i32, io::Error> {
        self.data.read_i32::<LittleEndian>()
    }

    pub fn read_u32(&mut self) -> Result<u32, io::Error> {
        self.data.read_u32::<LittleEndian>()
    }

    pub fn read_i64(&mut self) -> Result<i64, io::Error> {
        self.data.read_i64::<LittleEndian>()
    }

    pub fn read_u64(&mut self) -> Result<u64, io::Error> {
        self.data.read_u64::<LittleEndian>()
    }

    pub fn read_char(&mut self) -> Result<char, io::Error> {
        self.data
            .read_u32::<LittleEndian>()
            .map(|v| char::from_u32(v).unwrap())
    }

    pub fn read_str(&mut self, size: usize, reverse: Option<bool>) -> Result<String, io::Error> {
        let reverse = reverse.unwrap_or(false);
        let mut val = String::new();

        for _ in 0..size {
            if reverse {
                val = format!("{}{}", self.read_char()?, val);
            } else {
                val.push(self.read_char()?);
            }
        }

        Ok(val)
    }

    pub fn skip(&mut self, size: usize) -> Result<(), io::Error> {
        for _ in 0..size {
            self.read_u8()?;
        }

        Ok(())
    }

    pub fn len(&self) -> usize {
        self.data.len()
    }

    pub fn read_u8_at(&mut self, index: usize) -> Result<u8, Box<dyn Error>> {
        if let Some(val) = self.data.get(index) {
            return Ok(*val);
        }

        return Err("Index out of range!".into());
    }
}

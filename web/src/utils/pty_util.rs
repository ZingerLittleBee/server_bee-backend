pub static MAGIC_FLAG: [u8; 2] = [0x37, 0x37];
pub fn makeword(a: u8, b: u8) -> u16 {
    ((a as u16) << 8) | b as u16
}

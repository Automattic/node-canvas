#[napi(string_enum)]
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub enum ImageKind {
    #[default]
    Image,
    Pdf,
    Svg,
}

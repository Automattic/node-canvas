#[napi(object)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, Builder)]
pub struct FontOptions {
    pub family: String,
    pub weight: Option<String>,
    pub style: Option<String>,
}

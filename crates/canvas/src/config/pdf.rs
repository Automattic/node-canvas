#[napi(object)]
#[derive(Debug, Clone, PartialEq, PartialOrd, Default, Serialize, Deserialize)]
pub struct PdfConfig {
    pub title: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Option<String>,
    pub creator: Option<String>,
    pub creation_date: f64,
    pub mod_date: Option<f64>,
}

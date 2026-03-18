use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Config {
    /// JWT session token obtained via `dcf login` (device flow)
    pub token: Option<String>,
    /// Email of the logged-in user (display only)
    pub email: Option<String>,
    /// Backend API base URL — override with DOCFORGE_API env var
    pub api_url: Option<String>,

    // Legacy local keys — still supported for users who prefer not to create an account
    pub gemini_key: Option<String>,
    pub groq_key: Option<String>,
}

impl Config {
    pub fn is_logged_in(&self) -> bool {
        self.token.is_some()
    }

    /// Returns the backend URL, defaulting to the public production API.
    pub fn api_base(&self) -> String {
        std::env::var("DOCFORGE_API")
            .ok()
            .or_else(|| self.api_url.clone())
            .unwrap_or_else(|| "http://localhost:8000".to_string())
    }
}

pub fn config_path() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("docforge")
        .join("config.toml")
}

pub fn load_config() -> Result<Config> {
    let path = config_path();

    let mut config: Config = if path.exists() {
        let content = std::fs::read_to_string(&path)?;
        toml::from_str(&content)?
    } else {
        Config::default()
    };

    // Legacy env-var fallback (kept for backwards compat)
    if let Ok(key) = std::env::var("GEMINI_API_KEY") {
        if !key.is_empty() {
            config.gemini_key = Some(key);
        }
    }
    if let Ok(key) = std::env::var("GROQ_API_KEY") {
        if !key.is_empty() {
            config.groq_key = Some(key);
        }
    }

    Ok(config)
}

pub fn save_config(config: &Config) -> Result<()> {
    let path = config_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let content = toml::to_string_pretty(config)?;
    std::fs::write(&path, content)?;
    Ok(())
}

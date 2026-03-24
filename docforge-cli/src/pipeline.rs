use anyhow::Result;
use colored::Colorize;
use indicatif::{ProgressBar, ProgressStyle};
use std::time::Duration;

use crate::config::Config;

pub struct PipelineOpts {
    pub input_type: Option<String>,
    pub format: String,
    pub output: String,
    pub overwrite: bool,
}

impl Default for PipelineOpts {
    fn default() -> Self {
        Self {
            input_type: None,
            format: "context_md".to_string(),
            output: ".context.md".to_string(),
            overwrite: false,
        }
    }
}

/// Detect input type from the raw string — used to tell the backend what it's receiving.
pub fn detect_input_type(input: &str) -> &'static str {
    if input.starts_with("crates:") { return "crates"; }
    if input.starts_with("gem:")    { return "rubygems"; }
    if input.starts_with("pub:")    { return "pubdev"; }
    if input.starts_with("nuget:")  { return "nuget"; }
    if input.starts_with("mvn:")    { return "maven"; }
    if input.starts_with("hex:")    { return "hex"; }
    if input.starts_with("cran:")   { return "cran"; }

    if input.starts_with("http://") || input.starts_with("https://") {
        return if input.contains("github.com") { "github" } else { "url" };
    }
    if input.contains("github.com") { return "github"; }

    if input.contains("==") || input.contains(">=") || input.contains("<=") {
        return "pypi";
    }

    // Maven: "groupId:artifactId" — colon with dots on the left (e.g. com.google.guava:guava)
    if let Some(colon_pos) = input.find(':') {
        let before = &input[..colon_pos];
        if before.contains('.') && !before.contains('/') && !before.contains(' ') {
            return "maven";
        }
    }

    "npm"
}

fn spinner(msg: &str) -> ProgressBar {
    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .tick_chars("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ ")
            .template("  {spinner:.blue} {msg}")
            .unwrap(),
    );
    pb.set_message(msg.to_string());
    pb.enable_steady_tick(Duration::from_millis(80));
    pb
}

/// Run the pipeline — always via the backend.
/// If signed in: uses Bearer token (backend resolves user's stored keys).
/// If not signed in: sends local gemini_key/groq_key in the request body.
pub async fn run(input: &str, config: &Config, opts: &PipelineOpts) -> Result<()> {
    // Require either a session token OR at least one local key
    if config.token.is_none() && config.gemini_key.is_none() && config.groq_key.is_none() {
        return Err(anyhow::anyhow!(
            "Not signed in and no API keys configured.\n\
             Run {} to sign in, or {} to set a local key.",
            "dcf login".cyan(),
            "dcf config --gemini-key KEY".cyan()
        ));
    }

    let api = config.api_base();
    let client = reqwest::Client::new();

    let input_type = opts
        .input_type
        .as_deref()
        .unwrap_or_else(|| detect_input_type(input));

    let pb = spinner(&format!("Submitting {} to DocForge…", input.cyan()));

    let mut body = serde_json::json!({
        "input": input,
        "input_type": input_type,
        "output_format": if opts.format == "json" { "json" } else { "context_md" },
    });

    // Pass local keys in body when not signed in
    if config.token.is_none() {
        if let Some(k) = &config.gemini_key {
            body["gemini_key"] = serde_json::Value::String(k.clone());
        }
        if let Some(k) = &config.groq_key {
            body["groq_key"] = serde_json::Value::String(k.clone());
        }
    }

    let mut req = client.post(format!("{}/api/context", api)).json(&body);
    if let Some(token) = &config.token {
        req = req.bearer_auth(token);
    }

    let resp = req
        .send()
        .await
        .map_err(|e| { pb.finish_and_clear(); anyhow::anyhow!("Backend unreachable: {}", e) })?;

    if !resp.status().is_success() {
        pb.finish_and_clear();
        return Err(anyhow::anyhow!("Backend error: {}", resp.text().await?));
    }

    let created: serde_json::Value = resp.json().await?;
    let job_id = created["job_id"].as_str().unwrap_or("").to_string();

    pb.set_message(format!("Crawling docs for {}…", input.cyan()));

    // Poll until complete
    loop {
        tokio::time::sleep(Duration::from_secs(2)).await;

        let mut poll_req = client.get(format!("{}/api/context/{}", api, job_id));
        if let Some(token) = &config.token {
            poll_req = poll_req.bearer_auth(token);
        }

        let poll = poll_req
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        match poll["status"].as_str() {
            Some("complete") => {
                pb.finish_and_clear();
                let library = poll["library"].as_str().unwrap_or(input);
                let version = poll["version"].as_str().unwrap_or("latest");
                println!(
                    "  {} {}@{}",
                    "✓".green(),
                    library.cyan().bold(),
                    version.dimmed()
                );
                let content = poll["output"].as_str().unwrap_or("").to_string();
                return write_output(&content, &opts.output, opts.overwrite);
            }
            Some("failed") => {
                pb.finish_and_clear();
                return Err(anyhow::anyhow!(
                    "Pipeline failed: {}",
                    poll["error"].as_str().unwrap_or("unknown error")
                ));
            }
            Some("processing") => {
                pb.set_message(format!("Structuring with AI for {}…", input.cyan()));
            }
            _ => {} // queued — keep polling
        }
    }
}

fn write_output(content: &str, path: &str, overwrite: bool) -> Result<()> {
    if !overwrite && std::path::Path::new(path).exists() {
        let existing = std::fs::read_to_string(path)?;
        std::fs::write(path, format!("{}\n\n---\n\n{}", existing.trim_end(), content))?;
        println!("  {} Appended to {}", "↓".green(), abs_path(path).cyan());
    } else {
        std::fs::write(path, content)?;
        println!("  {} Written to  {}", "↓".green(), abs_path(path).cyan());
    }
    Ok(())
}

fn abs_path(path: &str) -> String {
    std::fs::canonicalize(path)
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| {
            std::env::current_dir()
                .map(|d| d.join(path).display().to_string())
                .unwrap_or_else(|_| path.to_string())
        })
}

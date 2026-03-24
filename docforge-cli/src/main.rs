use anyhow::Result;
use clap::{Parser, Subcommand};
use colored::Colorize;
use rustyline::error::ReadlineError;

mod banner;
mod config;
mod pipeline;

#[derive(Parser)]
#[command(
    name = "dcf",
    about = "DocForge — craft AI-ready context files for any library",
    disable_help_subcommand = true,
    disable_version_flag = true
)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Generate a context file for a package, URL, or GitHub repo
    Generate {
        /// Package (react@18), PyPI (fastapi==0.110), GitHub URL, or any URL
        input: String,

        /// Input type: npm | pypi | url | github  (auto-detected if omitted)
        #[arg(long = "type", value_name = "TYPE")]
        input_type: Option<String>,

        /// Output format: context_md | json
        #[arg(long, default_value = "context_md")]
        format: String,

        /// Output file path
        #[arg(long, short, default_value = ".context.md")]
        output: String,

        /// Overwrite file instead of appending
        #[arg(long)]
        overwrite: bool,
    },

    /// Read package.json and generate context for all dependencies
    Detect {
        /// Output file path
        #[arg(long, short, default_value = ".context.md")]
        output: String,
    },

    /// Show current config / session status
    Config {
        /// Set Gemini API key (local fallback — prefer `dcf login` for account-based auth)
        #[arg(long)]
        gemini_key: Option<String>,

        /// Set Groq API key (local fallback)
        #[arg(long)]
        groq_key: Option<String>,

        /// Show current config
        #[arg(long)]
        show: bool,
    },

    /// Sign in to DocForge via browser (device flow)
    Login,

    /// Sign out and remove stored session token
    Logout,
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    let config = match config::load_config() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("  {} Failed to load config: {}", "⚠".yellow(), e);
            config::Config::default()
        }
    };

    let result = match cli.command {
        None => run_interactive(config).await,
        Some(Commands::Generate { input, input_type, format, output, overwrite }) => {
            let opts = pipeline::PipelineOpts { input_type, format, output, overwrite };
            pipeline::run(&input, &config, &opts).await
        }
        Some(Commands::Detect { output }) => run_detect(config, output).await,
        Some(Commands::Config { gemini_key, groq_key, show }) => {
            run_config(config, gemini_key, groq_key, show)
        }
        Some(Commands::Login)  => run_login(config).await,
        Some(Commands::Logout) => run_logout(config),
    };

    if let Err(e) = result {
        eprintln!("\n  {} {}\n", "✗".red().bold(), e);
        std::process::exit(1);
    }
}

// ── Interactive REPL ──────────────────────────────────────────────────────────

async fn run_interactive(mut config: config::Config) -> Result<()> {
    banner::print_banner();

    // First-run: not logged in and no local keys
    if !config.is_logged_in() && config.gemini_key.is_none() && config.groq_key.is_none() {
        println!("  {} Not signed in.\n", "⚠".yellow().bold());
        println!(
            "  {} Run {} to sign in via browser  {}",
            "·".dimmed(),
            "dcf login".cyan().bold(),
            "(recommended)".dimmed()
        );
        println!(
            "  {} Or run {} to set local API keys {}\n",
            "·".dimmed(),
            "dcf config --gemini-key KEY".cyan(),
            "(no account needed)".dimmed()
        );
        print!("  {} Sign in now? [Y/n] ", "◆".blue().bold());
        use std::io::Write;
        std::io::stdout().flush()?;

        let mut ans = String::new();
        std::io::stdin().read_line(&mut ans)?;
        if !ans.trim().eq_ignore_ascii_case("n") {
            run_login(config.clone()).await?;
            config = config::load_config().unwrap_or_default();
        }
        println!();
    }

    if let Some(email) = &config.email {
        println!(
            "  {} Signed in as {}\n",
            "◆".blue().bold(),
            email.cyan()
        );
    }

    println!(
        "  {} Enter a package, GitHub URL, or docs URL. {}",
        "◆".blue().bold(),
        "Ctrl+C to exit".dimmed()
    );
    println!(
        "  {} e.g. {}, {}, {}\n",
        " ".dimmed(),
        "react@18".cyan(),
        "fastapi==0.115".cyan(),
        "github.com/vercel/next.js".cyan()
    );

    let history_path = dirs::config_dir()
        .unwrap_or_default()
        .join("docforge")
        .join("history");

    let mut rl = rustyline::DefaultEditor::new()?;
    if history_path.exists() {
        let _ = rl.load_history(&history_path);
    }

    loop {
        match rl.readline(&format!("  {} ", "→".blue().bold())) {
            Ok(line) => {
                let input = line.trim().to_string();
                if input.is_empty() {
                    continue;
                }

                // normalise: strip leading "/" so /help == help, /exit == exit, etc.
                let cmd = input.trim_start_matches('/');

                match cmd {
                    "exit" | "quit" | "q" => break,
                    "help" | "?" | "--help" => {
                        print_interactive_help();
                        continue;
                    }
                    "clear" | "cls" => {
                        print!("\x1B[2J\x1B[H");
                        use std::io::Write;
                        std::io::stdout().flush()?;
                        banner::print_banner();
                        continue;
                    }
                    "config" => {
                        show_config(&config);
                        continue;
                    }
                    "login" => {
                        run_login(config.clone()).await?;
                        config = config::load_config().unwrap_or_default();
                        continue;
                    }
                    "logout" => {
                        run_logout(config.clone())?;
                        config = config::load_config().unwrap_or_default();
                        continue;
                    }
                    "open" | "view" => {
                        open_context_file(".context.md");
                        continue;
                    }
                    "where" => {
                        let abs = std::fs::canonicalize(".context.md")
                            .map(|p| p.display().to_string())
                            .unwrap_or_else(|_| {
                                std::env::current_dir()
                                    .map(|d| d.join(".context.md").display().to_string())
                                    .unwrap_or_else(|_| ".context.md".to_string())
                            });
                        println!("  {} {}", "↓".green(), abs.cyan());
                        continue;
                    }
                    // @package.json or @path/to/package.json → detect all deps
                    _ if cmd.starts_with('@') && cmd.ends_with(".json") => {
                        let path = cmd.trim_start_matches('@');
                        println!();
                        if let Err(e) = run_detect_path(&config, path, ".context.md").await {
                            println!("  {} {}", "✗".red().bold(), e);
                        }
                        println!();
                        continue;
                    }
                    _ => {}
                }

                let _ = rl.add_history_entry(&input);

                // Parse optional flags: --json, --output <path>
                // Use cmd (slash-stripped) so /react@18 works the same as react@18
                let mut clean = cmd.to_string();
                let mut repl_format = "context_md".to_string();
                let mut repl_output = ".context.md".to_string();

                if let Some(idx) = clean.find("--output ") {
                    let rest = &clean[idx + 9..];
                    let end = rest.find(|c: char| c == ' ' || c == ',').unwrap_or(rest.len());
                    repl_output = rest[..end].trim().to_string();
                    clean = format!("{} {}", &clean[..idx], &clean[idx + 9 + end..]).trim().to_string();
                }
                if clean.contains("--json") {
                    repl_format = "json".to_string();
                    clean = clean.replace("--json", "").split_whitespace().collect::<Vec<_>>().join(" ");
                }

                // split on commas or newlines so users can paste a list
                let packages: Vec<&str> = clean
                    .split(|c| c == ',' || c == '\n')
                    .map(|s| s.trim())
                    .filter(|s| !s.is_empty())
                    .collect();

                let batch = packages.len() > 1;
                for (i, pkg) in packages.iter().enumerate() {
                    println!();
                    let opts = pipeline::PipelineOpts {
                        format: repl_format.clone(),
                        output: repl_output.clone(),
                        ..Default::default()
                    };
                    if let Err(e) = pipeline::run(pkg, &config, &opts).await {
                        println!("  {} {}", "✗".red().bold(), e);
                    }
                    // throttle between packages in a batch to avoid API rate limits
                    if batch && i + 1 < packages.len() {
                        tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
                    }
                }
                println!();
            }
            Err(ReadlineError::Interrupted) | Err(ReadlineError::Eof) => break,
            Err(e) => {
                eprintln!("  readline error: {}", e);
                break;
            }
        }
    }

    if let Some(parent) = history_path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let _ = rl.save_history(&history_path);

    println!("\n  {} See you next time!\n", "◆".blue().bold());
    Ok(())
}

// ── detect command ────────────────────────────────────────────────────────────

async fn run_detect_path(config: &config::Config, path: &str, output: &str) -> Result<()> {
    let raw = std::fs::read_to_string(path)
        .map_err(|_| anyhow::anyhow!("File not found: {}", path))?;
    process_package_json(config, &raw, output).await
}

async fn run_detect(config: config::Config, output: String) -> Result<()> {
    let raw = std::fs::read_to_string("package.json")
        .map_err(|_| anyhow::anyhow!("No package.json found in current directory"))?;
    process_package_json(&config, &raw, &output).await
}

async fn process_package_json(config: &config::Config, raw: &str, output: &str) -> Result<()> {

    let data: serde_json::Value = serde_json::from_str(&raw)?;
    let mut deps: Vec<String> = Vec::new();

    for section in &["dependencies", "devDependencies"] {
        if let Some(obj) = data[section].as_object() {
            for (name, ver) in obj {
                let v = ver
                    .as_str()
                    .unwrap_or("latest")
                    .trim_start_matches('^')
                    .trim_start_matches('~');
                deps.push(format!("{}@{}", name, v));
            }
        }
    }

    if deps.is_empty() {
        println!("  {} No dependencies found in package.json", "⚠".yellow());
        return Ok(());
    }

    println!("  {} Found {} packages\n", "◆".blue(), deps.len());

    let mut failed: Vec<String> = Vec::new();

    for (i, dep) in deps.iter().enumerate() {
        println!("  Processing {}...", dep.cyan());
        let opts = pipeline::PipelineOpts {
            output: output.to_string(),
            overwrite: false,
            ..Default::default()
        };

        // Retry up to 3 times on rate limit errors, with a 60s cooldown each time
        let mut attempts = 0u32;
        let mut succeeded = false;
        loop {
            match pipeline::run(dep, config, &opts).await {
                Ok(()) => { succeeded = true; break; }
                Err(e) => {
                    let msg = e.to_string();
                    let is_rate_limit = msg.contains("rate limit")
                        || msg.contains("rate-limit")
                        || msg.contains("rate_limit");
                    attempts += 1;
                    if is_rate_limit && attempts < 3 {
                        println!(
                            "  {} Rate limit hit ({}/3) — waiting 60s before retry…",
                            "⚠".yellow(), attempts
                        );
                        tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
                        println!("  Retrying {}...", dep.cyan());
                    } else {
                        println!("  {} {}: {}", "✗".red(), dep, msg);
                        break;
                    }
                }
            }
        }
        if !succeeded {
            failed.push(dep.clone());
        }

        println!();
        // throttle between packages to avoid API rate limits
        if i + 1 < deps.len() {
            tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
        }
    }

    if !failed.is_empty() {
        println!(
            "  {} {}/{} packages failed. Retry them with:\n",
            "⚠".yellow().bold(),
            failed.len(),
            deps.len()
        );
        println!("  {} {}\n", "→".blue().bold(), failed.join(", ").cyan());
    }

    Ok(())
}

// ── config command ────────────────────────────────────────────────────────────

fn run_config(
    mut config: config::Config,
    gemini_key: Option<String>,
    groq_key: Option<String>,
    show: bool,
) -> Result<()> {
    if show || (gemini_key.is_none() && groq_key.is_none()) {
        show_config(&config);
        return Ok(());
    }
    if let Some(k) = gemini_key {
        config.gemini_key = Some(k);
        println!("  {} Gemini key set", "✓".green());
    }
    if let Some(k) = groq_key {
        config.groq_key = Some(k);
        println!("  {} Groq key set", "✓".green());
    }
    config::save_config(&config)?;
    println!(
        "  {} Saved to {}",
        "↓".green(),
        config::config_path().display().to_string().cyan()
    );
    Ok(())
}

// ── login command (device flow) ───────────────────────────────────────────────

async fn run_login(mut config: config::Config) -> Result<()> {
    let api = config.api_base();

    println!("\n  {} {} Login\n", "◆".blue().bold(), "DocForge".bold());

    // 1. Request a device code from the backend
    let client = reqwest::Client::new();
    let resp = client
        .post(format!("{}/api/auth/device/init", api))
        .send()
        .await
        .map_err(|e| anyhow::anyhow!("Cannot reach backend at {}: {}", api, e))?;

    if !resp.status().is_success() {
        return Err(anyhow::anyhow!("Backend error: {}", resp.text().await?));
    }

    let data: serde_json::Value = resp.json().await?;
    let device_code = data["device_code"].as_str().unwrap_or("").to_string();
    let user_code   = data["user_code"].as_str().unwrap_or("").to_string();
    let verify_url  = data["verification_uri"].as_str().unwrap_or("").to_string();
    let interval    = data["interval"].as_u64().unwrap_or(5);

    println!("  {} Open this URL in your browser:\n", "◆".blue().bold());
    println!("     {}\n", verify_url.cyan().underline());
    println!("  {} Enter this code on that page:\n", "◆".blue().bold());
    println!("     {}\n", user_code.white().bold());
    println!("  {} Waiting for confirmation…\n", "·".dimmed());

    // 2. Poll until verified or expired
    let spinner_chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let mut tick = 0usize;

    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(interval)).await;

        let poll = client
            .get(format!(
                "{}/api/auth/device/poll?device_code={}",
                api,
                urlencoding::encode(&device_code)
            ))
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        match poll["status"].as_str() {
            Some("complete") => {
                let token = poll["access_token"].as_str().unwrap_or("").to_string();
                let email = poll["email"].as_str().unwrap_or("").to_string();
                config.token = Some(token);
                config.email = Some(email.clone());
                config::save_config(&config)?;
                println!(
                    "\r  {} Signed in as {}\n",
                    "✓".green().bold(),
                    email.cyan()
                );
                return Ok(());
            }
            Some("expired") => {
                return Err(anyhow::anyhow!("Code expired. Run `dcf login` again."));
            }
            _ => {
                // Still pending — show spinner
                print!(
                    "\r  {} Waiting{}",
                    spinner_chars[tick % spinner_chars.len()].blue(),
                    ".".repeat((tick / 3) % 4)
                );
                use std::io::Write;
                std::io::stdout().flush()?;
                tick += 1;
            }
        }
    }
}

// ── logout command ────────────────────────────────────────────────────────────

fn run_logout(mut config: config::Config) -> Result<()> {
    config.token = None;
    config.email = None;
    config::save_config(&config)?;
    println!("\n  {} Signed out.\n", "✓".green().bold());
    Ok(())
}

// ── helpers ───────────────────────────────────────────────────────────────────

fn show_config(config: &config::Config) {
    println!("\n  {} Current Configuration\n", "◆".blue().bold());

    let session = if let Some(email) = &config.email {
        format!("{} {}", "✓".green(), email.cyan())
    } else {
        format!("{} not signed in  (run {})", "✗".red(), "dcf login".cyan())
    };

    let gemini = config
        .gemini_key
        .as_deref()
        .map(|k| format!("{} {}... (local)", "✓".green(), &k[..k.len().min(8)]))
        .unwrap_or_else(|| format!("{} not set", "·".dimmed()));

    let groq = config
        .groq_key
        .as_deref()
        .map(|k| format!("{} {}... (local)", "✓".green(), &k[..k.len().min(8)]))
        .unwrap_or_else(|| format!("{} not set", "·".dimmed()));

    println!("  Account          {}", session);
    println!("  Backend          {}", config.api_base().cyan());
    println!("  GEMINI_API_KEY   {}", gemini);
    println!("  GROQ_API_KEY     {}", groq);
    println!(
        "  Config file      {}",
        config::config_path().display().to_string().cyan()
    );
    println!();
}

fn open_context_file(path: &str) {
    if !std::path::Path::new(path).exists() {
        println!("  {} {} not found — generate some context first", "⚠".yellow(), path.cyan());
        return;
    }

    // $EDITOR first, then platform default opener
    let editor = std::env::var("EDITOR").unwrap_or_default();
    let result = if !editor.is_empty() {
        std::process::Command::new(&editor).arg(path).status()
    } else {
        #[cfg(target_os = "macos")]
        { std::process::Command::new("open").arg(path).status() }
        #[cfg(target_os = "windows")]
        { std::process::Command::new("cmd").args(["/C", "start", path]).status() }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        { std::process::Command::new("xdg-open").arg(path).status() }
    };

    match result {
        Ok(_) => println!("  {} Opened {}", "✓".green(), path.cyan()),
        Err(e) => println!("  {} Could not open {}: {}", "✗".red(), path.cyan(), e),
    }
}

fn print_interactive_help() {
    println!("\n  {} DocForge — interactive mode\n", "◆".blue().bold());

    println!("  {} {}", "Packages".white().bold(), "(type directly, no command needed)".dimmed());
    println!("    {}        npm package", "react@18".cyan());
    println!("    {}   scoped npm", "@tanstack/react-query@5".cyan());
    println!("    {}     PyPI", "fastapi==0.115".cyan());
    println!("    {} GitHub repo", "github.com/vercel/next.js".cyan());
    println!("    {}  any docs URL", "https://docs.example.com".cyan());
    println!("    {}   Rust crate (crates.io)", "crates:serde@1.0".cyan());
    println!("    {}      Ruby gem", "gem:rails@7.1".cyan());
    println!("    {}  Dart/Flutter package", "pub:flutter_bloc@8".cyan());
    println!("    {}    .NET package (NuGet)", "nuget:Newtonsoft.Json".cyan());
    println!("    {}  Java artifact (Maven)", "com.google.guava:guava".cyan());
    println!("    {}    Elixir package (Hex)", "hex:phoenix@1.7".cyan());
    println!("    {}       R package (CRAN)", "cran:ggplot2".cyan());
    println!("    {}         scan all deps in package.json", "@package.json".cyan());
    println!("    {}  comma-separated batch", "react@18, vue@3, svelte@5".cyan());
    println!();

    println!("  {} {}", "Flags".white().bold(), "(append to any package input)".dimmed());
    println!("    {}         output as JSON", "--json".cyan());
    println!("    {}  write to custom path", "--output libs.md".cyan());
    println!();

    println!("  {} {}", "Commands".white().bold(), "(prefix / optional, e.g. /help or just help)".dimmed());
    println!("    {}   clear the screen and redraw banner", "/clear".cyan());
    println!("    {}    open .context.md in your editor", "/open".cyan());
    println!("    {}   print full path to .context.md", "/where".cyan());
    println!("    {}  show account & API key status", "/config".cyan());
    println!("    {}   sign in via browser (device flow)", "/login".cyan());
    println!("    {}  sign out", "/logout".cyan());
    println!("    {}    show this help", "/help".cyan());
    println!("    {}    quit\n", "/exit".cyan());
}

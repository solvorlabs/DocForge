use colored::Colorize;
use std::io::Write;

pub fn print_banner() {
    print!("\x1B[2J\x1B[H");
    let _ = std::io::stdout().flush();

    // ── Logo ──────────────────────────────────────────────────────────────────
    println!();
    println!("  {}", "██████╗  ██████╗  ██████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗".cyan().bold());
    println!("  {}", "██╔══██╗██╔═══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝".cyan().bold());
    println!("  {}", "██║  ██║██║   ██║██║     █████╗  ██║   ██║██████╔╝██║  ███╗█████╗  ".cyan());
    println!("  {}", "██║  ██║██║   ██║██║     ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ".cyan());
    println!("  {}", "██████╔╝╚██████╔╝╚██████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗".cyan().bold());
    println!("  {}", "╚═════╝  ╚═════╝  ╚═════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝".cyan().bold());
    println!();

    // ── Quick-start box ───────────────────────────────────────────────────────
    let w = 72usize;
    let top    = format!("  ╭{}╮", "─".repeat(w));
    let bottom = format!("  ╰{}╯", "─".repeat(w));
    let div    = format!("  ├{}┤", "─".repeat(w));

    println!("{}", top.dimmed());

    // header row
    row(w, &fmt_kv("  What to type", "", 28), "");

    println!("{}", div.dimmed());

    // examples
    row(w, &fmt_kv("  react@18",                       "npm package",                    36), "");
    row(w, &fmt_kv("  @tanstack/react-query@5",         "scoped npm package",             36), "");
    row(w, &fmt_kv("  fastapi==0.115",                  "PyPI package",                   36), "");
    row(w, &fmt_kv("  crates:serde@1.0",                "Rust crate",                     36), "");
    row(w, &fmt_kv("  gem:rails@7.1",                   "Ruby gem",                       36), "");
    row(w, &fmt_kv("  pub:flutter_bloc",                "Dart/Flutter",                   36), "");
    row(w, &fmt_kv("  github.com/vercel/next.js",       "GitHub repo",                    36), "");
    row(w, &fmt_kv("  https://docs.stripe.com",         "any documentation URL",          36), "");

    println!("{}", div.dimmed());

    row(w, &fmt_kv("  @package.json",                   "scan ALL deps in package.json",  36), "");
    row(w, &fmt_kv("  react@18, vue@3, svelte@5",       "batch — comma or newline",       36), "");
    row(w, &fmt_kv("  react@18 --json",                 "output as JSON",                 36), "");
    row(w, &fmt_kv("  react@18 --output libs.md",       "write to a custom file",         36), "");

    println!("{}", div.dimmed());

    // commands hint row
    let cmds = format!(
        "  {}  {}  {}  {}  {}  {}  {}  {}",
        "/help".cyan(), "/clear".cyan(), "/open".cyan(), "/where".cyan(),
        "/config".cyan(), "/login".cyan(), "/logout".cyan(), "/exit".cyan()
    );
    row(w, &cmds, "");

    println!("{}", bottom.dimmed());
    println!();
}

/// Format a key → value pair: key in cyan, padded to `pad`, value in dim white.
fn fmt_kv(key: &str, val: &str, pad: usize) -> String {
    if val.is_empty() {
        // section header style
        format!("{}", key.white().bold())
    } else {
        format!("{:<pad$}{}", key.cyan(), val.dimmed(), pad = pad)
    }
}

/// Print one bordered row: "  │ <content padded to w-2> │"
fn row(w: usize, content: &str, _unused: &str) {
    // strip ANSI to compute visible length for padding
    let visible_len = strip_ansi(content).len();
    let pad = if w.saturating_sub(2) > visible_len {
        w - 2 - visible_len
    } else {
        0
    };
    println!(
        "  {} {}{} {}",
        "│".dimmed(),
        content,
        " ".repeat(pad),
        "│".dimmed()
    );
}

/// Remove ANSI escape codes to measure printable width.
fn strip_ansi(s: &str) -> String {
    let mut out = String::new();
    let mut in_esc = false;
    for c in s.chars() {
        if in_esc {
            if c.is_alphabetic() { in_esc = false; }
        } else if c == '\x1B' {
            in_esc = true;
        } else {
            out.push(c);
        }
    }
    out
}

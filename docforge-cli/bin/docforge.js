#!/usr/bin/env node
/**
 * DocForge CLI
 * Usage:
 *   docforge generate react-bits@2.1.4
 *   docforge generate @tanstack/react-query --format json
 *   docforge generate https://docs.example.com
 *   docforge detect                        (reads package.json in cwd)
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// ── ANSI colors (zero dependencies) ───────────────────────────────────────
const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  blue:   "\x1b[34m",
  cyan:   "\x1b[36m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  white:  "\x1b[37m",
  gray:   "\x1b[90m",
  bgBlue: "\x1b[44m",
};
const b  = (s) => `${c.bold}${s}${c.reset}`;
const bl = (s) => `${c.blue}${s}${c.reset}`;
const cy = (s) => `${c.cyan}${s}${c.reset}`;
const gr = (s) => `${c.gray}${s}${c.reset}`;
const gn = (s) => `${c.green}${s}${c.reset}`;
const yw = (s) => `${c.yellow}${s}${c.reset}`;
const rd = (s) => `${c.red}${s}${c.reset}`;
const dim = (s) => `${c.dim}${s}${c.reset}`;

// ── Config ────────────────────────────────────────────────────────────────
const DEFAULT_BACKEND = "http://localhost:8000";
const POLL_INTERVAL_MS = 2000;

// ── CLI arg parsing ────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function printBanner() {
  console.log(`
${c.blue}${c.bold}  ██████╗  ██████╗  ██████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗
  ██╔══██╗██╔═══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
  ██║  ██║██║   ██║██║     █████╗  ██║   ██║██████╔╝██║  ███╗█████╗
  ██║  ██║██║   ██║██║     ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝
  ██████╔╝╚██████╔╝╚██████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚═════╝  ╚═════╝  ╚═════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝${c.reset}
  ${dim("Generate prompt-ready AI context files — pinned to your exact version.")}
`);
}

function printHelp() {
  printBanner();
  console.log(
    `  ${b("USAGE")}\n` +
    `    ${cy("docforge")} ${yw("generate")} ${bl("<package|url>")}  ${gr("[options]")}\n` +
    `    ${cy("docforge")} ${yw("detect")}                  ${gr("[options]")}\n`
  );

  console.log(`  ${b("COMMANDS")}`);
  console.log(`    ${yw("generate")} ${bl("<input>")}    Generate a context file for a package or URL`);
  console.log(`    ${gr("Examples:")}`);
  console.log(`      ${dim("$")} docforge generate ${bl("react-bits@2.1.4")}`);
  console.log(`      ${dim("$")} docforge generate ${bl("fastapi==0.110.0")} --type pypi`);
  console.log(`      ${dim("$")} docforge generate ${bl("https://github.com/DavidHDev/react-bits")}`);
  console.log(`      ${dim("$")} docforge generate ${bl("https://reactbits.dev")}`);
  console.log();
  console.log(`    ${yw("detect")}              Read ${bl("package.json")} and generate context for all deps`);
  console.log(`    ${gr("Example:")}`);
  console.log(`      ${dim("$")} docforge detect`);
  console.log(`      ${dim("$")} docforge detect --append --output docs.context.md`);
  console.log();

  console.log(`  ${b("OPTIONS")}`);
  const opt = (flag, desc, def) =>
    `    ${gn(flag.padEnd(22))} ${desc}${def ? `  ${dim("(default: " + def + ")")}` : ""}`;
  console.log(opt("--type <type>",   "npm | pypi | url | github | paste", "auto-detected"));
  console.log(opt("--format <fmt>",  "context_md | json", "context_md"));
  console.log(opt("--output <file>", "Output file path", ".context.md"));
  console.log(opt("--append",        "Append to existing file instead of overwriting"));
  console.log(opt("--backend <url>", "Backend URL", DEFAULT_BACKEND));
  console.log(opt("--help",          "Show this help"));
  console.log();

  console.log(`  ${b("ENVIRONMENT")}`);
  console.log(`    ${gn("DOCFORGE_BACKEND")}       Overrides --backend default`);
  console.log();
}

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  printHelp();
  process.exit(0);
}

const command = args[0];
const positional = args.filter((a) => !a.startsWith("--") && a !== command);
const flags = {};
for (let i = 1; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].slice(2);
    flags[key] = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : true;
  }
}

const BACKEND = process.env.DOCFORGE_BACKEND || flags.backend || DEFAULT_BACKEND;
const OUTPUT_FILE = flags.output || ".context.md";
const OUTPUT_FORMAT = flags.format || "context_md";
const APPEND = !!flags.append;

// ── HTTP helpers ───────────────────────────────────────────────────────────
function request(method, url, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: { "Content-Type": "application/json" },
    };
    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ── Auto-detect input type ─────────────────────────────────────────────────
function detectInputType(input) {
  if (flags.type) return flags.type;
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input.includes("github.com") ? "github" : "url";
  }
  if (input.includes("==")) return "pypi";
  return "npm";
}

// ── Core: submit job + poll ────────────────────────────────────────────────
async function generateContext(input) {
  const input_type = detectInputType(input);
  console.log(`\n  ${b("→")} ${cy(input)}  ${dim("(" + input_type + ")")}`);

  const job = await request("POST", `${BACKEND}/api/context`, {
    input,
    input_type,
    output_format: OUTPUT_FORMAT,
  });

  if (!job.job_id) {
    console.error(`  ${rd("✗")} Backend did not return a job ID.`, job);
    process.exit(1);
  }

  process.stdout.write(`  ${dim("⠿")} Queued as ${gr(job.job_id.slice(0, 8))}…  `);

  const spinner = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
  let tick = 0;
  while (true) {
    await sleep(POLL_INTERVAL_MS);
    const status = await request("GET", `${BACKEND}/api/context/${job.job_id}`);

    if (status.status === "complete") {
      process.stdout.write(`\r  ${gn("✓")} Done!               \n`);
      return status;
    } else if (status.status === "failed") {
      process.stdout.write(`\r  ${rd("✗")} Failed              \n`);
      console.error(`  ${rd("Error:")} ${status.error}`);
      process.exit(1);
    } else {
      const frame = spinner[tick++ % spinner.length];
      process.stdout.write(`\r  ${c.cyan}${frame}${c.reset} ${status.status ?? "processing"}…   `);
    }
  }
}

function writeOutput(content, label) {
  const fullPath = path.resolve(OUTPUT_FILE);
  const ext = OUTPUT_FORMAT === "json" ? ".json" : path.extname(OUTPUT_FILE) || ".md";
  const finalPath = OUTPUT_FORMAT === "json"
    ? fullPath.replace(/\.[^.]+$/, ext)
    : fullPath;

  if (APPEND && fs.existsSync(finalPath)) {
    const existing = fs.readFileSync(finalPath, "utf-8").trimEnd();
    fs.writeFileSync(finalPath, existing + "\n\n---\n\n" + content);
    console.log(`  ${gn("↓")} Appended to ${bl(finalPath)}`);
  } else {
    fs.writeFileSync(finalPath, content);
    console.log(`  ${gn("↓")} Written to  ${bl(finalPath)}`);
  }
}

// ── detect command ─────────────────────────────────────────────────────────
async function runDetect() {
  const pkgPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(pkgPath)) {
    console.error("  No package.json found in current directory.");
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const all = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };

  // Filter out URL-based deps
  const URL_RE = /^(https?:|git\+|git:|github:|file:)/;
  const packages = Object.entries(all)
    .filter(([, v]) => !URL_RE.test(v))
    .map(([name, ver]) => {
      const cleaned = String(ver).replace(/^[^0-9]*/, "") || "latest";
      return `${name}@${cleaned}`;
    });

  if (packages.length === 0) {
    console.log("  No npm dependencies found.");
    process.exit(0);
  }

  console.log(`\n  ${gn("✓")} Found ${b(packages.length)} packages in ${bl("package.json")} — generating context...\n`);

  for (let i = 0; i < packages.length; i++) {
    const result = await generateContext(packages[i]);
    if (result.output) {
      writeOutput(result.output, packages[i]);
      // After first package, always append
      if (!APPEND) flags.append = true;
    }
  }

  console.log(`\n  ${gn("✓")} All done! Context written to ${bl(OUTPUT_FILE)}\n`);
}

// ── generate command ────────────────────────────────────────────────────────
async function runGenerate() {
  const input = positional[0];
  if (!input) {
    console.error("  Error: Please provide a package name or URL.\n");
    console.error("  Example: docforge generate react-bits@2.1.4\n");
    process.exit(1);
  }

  const result = await generateContext(input);
  if (result.output) {
    writeOutput(result.output, input);
  }
  console.log(`\n  ${gn("✓")} Done!\n`);
}

// ── Main ────────────────────────────────────────────────────────────────────
(async () => {
  try {
    if (command === "generate") {
      await runGenerate();
    } else if (command === "detect") {
      await runDetect();
    } else {
      console.error(`  Unknown command: ${command}`);
      printHelp();
      process.exit(1);
    }
  } catch (err) {
    console.error(`\n  ${rd("✗ Fatal:")} ${err.message}\n`);
    process.exit(1);
  }
})();

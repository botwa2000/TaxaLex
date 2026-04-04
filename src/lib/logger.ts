/**
 * Centralized logger — use this instead of console.log everywhere.
 *
 * Dev:  human-readable colored output
 * Prod: structured JSON, one object per line, sensitive fields stripped
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

// DEBUG_LOGS=true overrides NODE_ENV=production suppression (used on dev server).
const isProd = process.env.NODE_ENV === "production" && process.env.DEBUG_LOGS !== "true";

// Fields that must never appear in production logs
const REDACTED_KEYS = new Set([
  "apiKey",
  "api_key",
  "key",
  "secret",
  "token",
  "password",
  "authorization",
  "steuernummer",
  "content",
  "text",
  "rawText",
]);

function redact(obj: LogContext): LogContext {
  const result: LogContext = {};
  for (const [k, v] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(k)) {
      result[k] = "[REDACTED]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      result[k] = redact(v as LogContext);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function log(level: LogLevel, msg: string, context: LogContext = {}): void {
  if (isProd) {
    // Suppress debug in production
    if (level === "debug") return;

    const entry = JSON.stringify({
      level,
      ts: new Date().toISOString(),
      msg,
      env: "production",
      ...redact(context),
    });
    if (level === "error" || level === "warn") {
      process.stderr.write(entry + "\n");
    } else {
      process.stdout.write(entry + "\n");
    }
    return;
  }

  // Development: colored, human-readable
  const colors: Record<LogLevel, string> = {
    debug: "\x1b[90m", // gray
    info: "\x1b[36m", // cyan
    warn: "\x1b[33m", // yellow
    error: "\x1b[31m", // red
  };
  const reset = "\x1b[0m";
  const prefix = `${colors[level]}[${level.toUpperCase()}]${reset}`;
  const ts = new Date().toTimeString().slice(0, 8);

  if (Object.keys(context).length > 0) {
    console[level === "debug" ? "log" : level](
      `${ts} ${prefix} ${msg}`,
      context,
    );
  } else {
    console[level === "debug" ? "log" : level](`${ts} ${prefix} ${msg}`);
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => log("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => log("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => log("error", msg, ctx),

  /** Log an agent call with timing. Never logs response content in prod. */
  agent: (
    role: string,
    provider: string,
    model: string,
    durationMs: number,
    extra?: LogContext,
  ) =>
    log("info", `[agent] ${role} complete`, {
      role,
      provider,
      model,
      durationMs,
      ...extra,
    }),
};

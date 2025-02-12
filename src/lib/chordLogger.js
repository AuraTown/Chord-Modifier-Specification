// Logger configuration flags
export const LogConfig = {
  LOG_ASSIGNATION: true,
  LOG_OPERATIONS: true,
  LOG_PATTERNS: true,
  LOG_TRANSFORMS: true,
  LOG_MATCHER: true,
  LOG_ALL: true,
};

// Emoji categories for better visual organization
const LogEmoji = {
  ASSIGN: "🎯",
  OP: "⚡",
  PATTERN: "🔍",
  TRANSFORM: "🔄",
  MATCH: "🎭",
  START: "🎼",
  END: "🏁",
  ERROR: "❌",
  SUCCESS: "✅",
  WARNING: "⚠️",
  INFO: "💡",
  DEBUG: "🐛",
};

// ANSI color codes for terminal output
const Colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underscore: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

export class ChordLogger {
  static shouldLog(type) {
    return LogConfig.LOG_ALL || LogConfig[type];
  }

  static formatValue(value) {
    if (Array.isArray(value)) {
      return `[${value.join(", ")}]`;
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return value;
  }

  static divider(emoji) {
    if (!emoji) return console.log("\n" + "─".repeat(50) + "\n");
    console.log("\n" + emoji + " " + "─".repeat(48) + " " + emoji + "\n");
  }

  static assignation(message, data = null) {
    if (!this.shouldLog("LOG_ASSIGNATION")) return;
    console.log(
      `${LogEmoji.ASSIGN} ${Colors.cyan}ASSIGN:${Colors.reset} ${message}`
    );
    if (data) console.log(Colors.dim, this.formatValue(data), Colors.reset);
  }

  static operation(message, data = null) {
    if (!this.shouldLog("LOG_OPERATIONS")) return;
    console.log(
      `${LogEmoji.OP} ${Colors.magenta}OPERATION:${Colors.reset} ${message}`
    );
    if (data) console.log(Colors.dim, this.formatValue(data), Colors.reset);
  }

  static pattern(message, data = null) {
    if (!this.shouldLog("LOG_PATTERNS")) return;
    console.log(
      `${LogEmoji.PATTERN} ${Colors.yellow}PATTERN:${Colors.reset} ${message}`
    );
    if (data) console.log(Colors.dim, this.formatValue(data), Colors.reset);
  }

  static transform(message, data = null) {
    if (!this.shouldLog("LOG_TRANSFORMS")) return;
    console.log(
      `${LogEmoji.TRANSFORM} ${Colors.green}TRANSFORM:${Colors.reset} ${message}`
    );
    if (data) console.log(Colors.dim, this.formatValue(data), Colors.reset);
  }

  static matcher(message, data = null) {
    if (!this.shouldLog("LOG_MATCHER")) return;
    console.log(
      `${LogEmoji.MATCH} ${Colors.blue}MATCHER:${Colors.reset} ${message}`
    );
    if (data) console.log(Colors.dim, this.formatValue(data), Colors.reset);
  }

  static error(message, error = null) {
    console.log(
      `${LogEmoji.ERROR} ${Colors.red}ERROR:${Colors.reset} ${message}`
    );
    if (error) console.error(Colors.dim, error, Colors.reset);
  }

  static success(message, data = null) {
    console.log(
      `${LogEmoji.SUCCESS} ${Colors.green}SUCCESS:${Colors.reset} ${message}`
    );
    if (data) console.log(Colors.dim, this.formatValue(data), Colors.reset);
  }

  static warning(message, data = null) {
    console.log(
      `${LogEmoji.WARNING} ${Colors.yellow}WARNING:${Colors.reset} ${message}`
    );
    if (data) console.log(Colors.dim, this.formatValue(data), Colors.reset);
  }

  static info(message, data = null) {
    console.log(
      `${LogEmoji.INFO} ${Colors.blue}INFO:${Colors.reset} ${message}`
    );
    if (data) console.log(Colors.dim, this.formatValue(data), Colors.reset);
  }

  static debug(message, data = null) {
    console.log(
      `${LogEmoji.DEBUG} ${Colors.magenta}DEBUG:${Colors.reset} ${message}`
    );
    if (data) console.log(Colors.dim, this.formatValue(data), Colors.reset);
  }

  static startOperation(name) {
    console.log(
      `\n${LogEmoji.START} ${Colors.bright}Starting: ${name}${Colors.reset}`
    );
    this.divider();
  }

  static endOperation(name) {
    this.divider();
    console.log(
      `${LogEmoji.END} ${Colors.bright}Completed: ${name}${Colors.reset}\n`
    );
  }
}

// Usage example:
// LogConfig.LOG_OPERATIONS = true;
// ChordLogger.operation('Applying seventh', { type: 'add', value: 10 });

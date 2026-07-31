export class Logger {
  private static getTimestamp(): string {
    const d = new Date();
    return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
  }

  static info(category: string, message: string, data?: any) {
    const time = this.getTimestamp();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    console.log(`\x1b[36m[${time}]\x1b[0m \x1b[32m[${category}]\x1b[0m ${message}${dataStr}`);
  }

  static warn(category: string, message: string, data?: any) {
    const time = this.getTimestamp();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    console.log(`\x1b[36m[${time}]\x1b[0m \x1b[33m[${category}]\x1b[0m ⚠️ ${message}${dataStr}`);
  }

  static error(category: string, message: string, error?: any) {
    const time = this.getTimestamp();
    const errStr = error ? ` | ${error.stack || error.message || error}` : '';
    console.error(`\x1b[36m[${time}]\x1b[0m \x1b[31m[${category}]\x1b[0m ❌ ${message}${errStr}`);
  }
}

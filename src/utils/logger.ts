import * as fs from 'fs';
import * as path from 'path';

const logDir = path.resolve(process.cwd(), '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const allLogStream = fs.createWriteStream(path.join(logDir, 'all.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' });

function writeLog(stream: fs.WriteStream, level: string, ...args: any[]) {
  const msg = `[${new Date().toISOString()}] [${level}] ` + args.map(String).join(' ') + '\n';
  stream.write(msg);
}

export const logger = {
  info: (...args: any[]) => {
    writeLog(allLogStream, 'INFO', ...args);
  },
  error: (...args: any[]) => {
    writeLog(allLogStream, 'ERROR', ...args);
    writeLog(errorLogStream, 'ERROR', ...args);
  },
  warn: (...args: any[]) => {
    writeLog(allLogStream, 'WARN', ...args);
  },
  debug: (...args: any[]) => {
    writeLog(allLogStream, 'DEBUG', ...args);
  },
}; 
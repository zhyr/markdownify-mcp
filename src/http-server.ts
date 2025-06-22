import http from "http";
import url from "url";
import fs from "fs";
import path from "path";
import { Markdownify } from "./Markdownify.js";
import { randomUUID } from "crypto";
import { ImageToMarkdownTool } from './tools.js';

// 日志文件路径
const logDir = path.resolve(process.cwd(), "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const allLogStream = fs.createWriteStream(path.join(logDir, "all.log"), { flags: "a" });
const errorLogStream = fs.createWriteStream(path.join(logDir, "error.log"), { flags: "a" });

function logToFile(...args: any[]) {
  const msg = `[${new Date().toISOString()}] ` + args.map(String).join(" ") + "\n";
  allLogStream.write(msg);
}
function errorToFile(...args: any[]) {
  const msg = `[${new Date().toISOString()}] ` + args.map(String).join(" ") + "\n";
  allLogStream.write(msg);
  errorLogStream.write(msg);
}
const origLog = console.log;
const origError = console.error;
console.log = (...args: any[]) => {
  origLog(...args);
  logToFile(...args);
};
console.error = (...args: any[]) => {
  origError(...args);
  errorToFile(...args);
};

const server = http.createServer(async (req, res) => {
  const traceId = randomUUID();
  console.log(`[${traceId}] 收到请求:`, req.method, req.url);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url || "", true);
  const pathName = parsedUrl.pathname || "";

  try {
    if (pathName === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "OK", service: "Markdownify MCP HTTP Server" }));
      return;
    }

    // 统一处理 /tools/xxx 路由
    if (pathName.startsWith("/tools/")) {
      let body = "";
      req.on("data", chunk => { body += chunk.toString(); });
      req.on("end", async () => {
        try {
          const data = body ? JSON.parse(body) : {};
          const tool = pathName.replace("/tools/", "");
          console.log(`[${traceId}] [MCP] 工具调用: ${tool}, 参数:`, data);

          let result: any;
          switch (tool) {
            case "webpage-to-markdown":
            case "youtube-to-markdown":
              result = await Markdownify.toMarkdown({ url: data.url });
              break;
            case "pdf-to-markdown":
              if (!data.filePath) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ error: "filePath 参数缺失" }));
                return;
              }
              console.log(`[${traceId}] [MCP] 解析文件: ${data.filePath}`);
              result = await Markdownify.toMarkdown({ filePath: data.filePath });
              console.log(`[${traceId}] [MCP] 解析结果长度: ${result.text.length}`);
              break;
            case "image-to-markdown":
              if (!data.filePath) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ error: "filePath 参数缺失" }));
                return;
              }
              console.log(`[${traceId}] [MCP] 解析图片: ${data.filePath}`);
              // 校验参数
              ImageToMarkdownTool.inputSchema.parse({ filepath: data.filePath });
              result = await Markdownify.toMarkdown({ filePath: data.filePath });
              break;
            default:
              throw new Error(`未知或未实现的工具: ${tool}`);
          }

          res.writeHead(200, { "Content-Type": "application/json", "X-Trace-Id": traceId });
          res.end(JSON.stringify({ markdown: result.text, traceId }));
        } catch (error: any) {
          console.error(`[${traceId}] 处理 /tools/xxx 路由出错:`, error);
          res.writeHead(400, { "Content-Type": "application/json", "X-Trace-Id": traceId });
          res.end(JSON.stringify({ error: error.message || "无效的请求数据", traceId }));
        }
      });
      return;
    }

    // 兼容老路由
    if (pathName === "/webpage" && req.method === "POST") {
      let body = "";
      req.on("data", chunk => { body += chunk.toString(); });
      req.on("end", async () => {
        try {
          const data = JSON.parse(body);
          const markdown = await Markdownify.toMarkdown({ url: data.url });
          res.writeHead(200, { "Content-Type": "application/json", "X-Trace-Id": traceId });
          res.end(JSON.stringify({ markdown, traceId }));
        } catch (error: any) {
          res.writeHead(400, { "Content-Type": "application/json", "X-Trace-Id": traceId });
          res.end(JSON.stringify({ error: "无效的请求数据", traceId }));
        }
      });
      return;
    }

    // 其它路由
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "未找到路由" }));
  } catch (error: any) {
    console.error(`[${traceId}] 服务器错误:`, error);
    res.writeHead(500, { "Content-Type": "application/json", "X-Trace-Id": traceId });
    res.end(JSON.stringify({ error: "服务器内部错误", traceId }));
  }
});

const PORT = process.env.HTTP_PORT || 3005;
server.listen(PORT, () => {
  console.log(`Markdownify MCP HTTP服务器运行在 http://localhost:${PORT}`);
});
/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as http from 'http';
import * as url from 'url';
import { Markdownify } from "./Markdownify.js";
import { randomUUID } from "crypto";
import { ImageToMarkdownTool } from "./tools.js";
import { logger } from "./utils/logger.js";
import { ensurePythonDepsReady } from "./utils/python-check.js";

ensurePythonDepsReady();

function logBoth(...args: any[]) {
  logger.info(...args);
  console.log(...args);
}

function getErrorMessage(error: any) {
  return error?.message || String(error);
}

const server = http.createServer(async (req, res) => {
  const traceId = randomUUID();
  logBoth(`[${traceId}] 收到请求:`, req.method, req.url);

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
      logBoth(`[${traceId}] 响应: 200 /health`);
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
          logBoth(`[${traceId}] [MCP] 工具调用: ${tool}, 参数:`, data);

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
              logBoth(`[${traceId}] [MCP] 解析文件: ${data.filePath}`);
              result = await Markdownify.toMarkdown({ filePath: data.filePath });
              logBoth(`[${traceId}] [MCP] 解析结果长度: ${result.text.length}`);
              break;
            case "image-to-markdown":
              if (!data.filePath) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ error: "filePath 参数缺失" }));
                return;
              }
              logBoth(`[${traceId}] [MCP] 解析图片: ${data.filePath}`);
              // 基本参数校验
              if (!data.filePath || typeof data.filePath !== 'string') {
                throw new Error('无效的文件路径参数');
              }
              result = await Markdownify.toMarkdown({ filePath: data.filePath });
              break;
            default:
              throw new Error(`未知或未实现的工具: ${tool}`);
          }

          res.writeHead(200, { "Content-Type": "application/json", "X-Trace-Id": traceId });
          res.end(JSON.stringify({ markdown: result.text, traceId }));
          logBoth(`[${traceId}] 响应: 200 ${pathName}`);
          return;
        } catch (error: any) {
          logBoth(`[${traceId}] 处理 /tools/xxx 路由出错:`, error);
          res.writeHead(400, { "Content-Type": "application/json", "X-Trace-Id": traceId });
          res.end(JSON.stringify({ error: getErrorMessage(error) || "无效的请求数据", traceId }));
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
          const result = await Markdownify.toMarkdown({ url: data.url });
          logBoth(`[${traceId}] toMarkdown结果: path=${result.path}, text长度=${result.text?.length || 0}`);
          
          // 确保返回的内容不为空
          if (!result.text || result.text.trim().length < 10) {
            logBoth(`[${traceId}] 警告: 返回内容过短或为空`);
          }
          
          res.writeHead(200, { "Content-Type": "application/json", "X-Trace-Id": traceId });
          res.end(JSON.stringify({ markdown: result.text, traceId }));
          logBoth(`[${traceId}] 响应: 200 ${pathName}`);
          return;
        } catch (error: any) {
          logBoth(`[${traceId}] 处理 /webpage 路由出错:`, error);
          
          // 根据错误类型返回不同的状态码
          let statusCode = 500;
          let errorMessage = "服务器内部错误";
          
          if (error.message && error.message.includes("无效的请求数据")) {
            statusCode = 400;
            errorMessage = "无效的请求数据";
          } else if (error.message && error.message.includes("timeout")) {
            statusCode = 408;
            errorMessage = "请求超时，请稍后重试";
          } else if (error.message && error.message.includes("无法获取网页内容")) {
            statusCode = 502;
            errorMessage = "无法获取网页内容";
          } else if (error.message && error.message.includes("HTTP")) {
            statusCode = 502;
            errorMessage = "网页访问失败";
          }
          
          res.writeHead(statusCode, { "Content-Type": "application/json", "X-Trace-Id": traceId });
          res.end(JSON.stringify({ error: errorMessage, traceId }));
        }
      });
      return;
    }

    // 其它路由
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "未找到路由" }));
  } catch (error: any) {
    logBoth(`[${traceId}] 服务器错误:`, error);
    res.writeHead(500, { "Content-Type": "application/json", "X-Trace-Id": traceId });
    res.end(JSON.stringify({ error: "服务器内部错误", traceId }));
  }
});

const PORT = process.env.HTTP_PORT || 3005;
server.listen(PORT, () => {
  logBoth(`Markdownify MCP HTTP服务器运行在 http://localhost:${PORT}`);
});
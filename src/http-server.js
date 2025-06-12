// HTTP server for Markdownify MCP
import http from 'http';
import url from 'url';
import { MarkdownifyService } from './Markdownify.js';
import fs from 'fs';
import path from 'path';

// 初始化Markdownify服务
const markdownify = new MarkdownifyService();

// 日志文件路径
const logDir = path.resolve(process.cwd(), '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const allLogStream = fs.createWriteStream(path.join(logDir, 'all.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' });

function logToFile(...args) {
  const msg = `[${new Date().toISOString()}] ` + args.map(String).join(' ') + '\n';
  allLogStream.write(msg);
}
function errorToFile(...args) {
  const msg = `[${new Date().toISOString()}] ` + args.map(String).join(' ') + '\n';
  allLogStream.write(msg);
  errorLogStream.write(msg);
}
// 覆盖 console.log/console.error
const origLog = console.log;
const origError = console.error;
console.log = (...args) => {
  origLog(...args);
  logToFile(...args);
};
console.error = (...args) => {
  origError(...args);
  errorToFile(...args);
};

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
  console.log('收到请求:', req.method, req.url);
  // 设置CORS头，允许跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 解析URL
  const parsedUrl = url.parse(req.url || '', true);
  const pathName = parsedUrl.pathname || '';
  
  // 处理不同的路径
  try {
    if (pathName === '/health') {
      // 健康检查端点
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'OK', service: 'Markdownify MCP HTTP Server' }));
      return;
    }
    
    // 统一处理 /tools/xxx 路由
    if (pathName.startsWith('/tools/')) {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const data = body ? JSON.parse(body) : {};
          const tool = pathName.replace('/tools/', '');

          console.log(`[MCP] 工具调用: ${tool}, 参数:`, data);

          let result;
          switch (tool) {
            case 'webpage-to-markdown':
              result = await markdownify.webpageToMarkdown(data.url);
              break;
            case 'youtube-to-markdown':
              result = await markdownify.youtubeToMarkdown(data.url);
              break;
            case 'bing-search-to-markdown':
              result = await markdownify.bingSearchToMarkdown(data.query);
              break;
            case 'pdf-to-markdown':
              if (!data.filePath) throw new Error('filePath is required');
              result = await markdownify.pdfToMarkdown({ filePath: data.filePath });
              break;
            case 'image-to-markdown':
              result = await markdownify.imageToMarkdown(data.fileBuffer, data.filename);
              break;
            case 'audio-to-markdown':
              result = await markdownify.audioToMarkdown(data.fileBuffer, data.filename);
              break;
            case 'docx-to-markdown':
              result = await markdownify.officeToMarkdown(data.fileBuffer, data.filename);
              break;
            case 'xlsx-to-markdown':
              result = await markdownify.officeToMarkdown(data.fileBuffer, data.filename);
              break;
            case 'pptx-to-markdown':
              result = await markdownify.officeToMarkdown(data.fileBuffer, data.filename);
              break;
            case 'social-to-markdown':
              result = await markdownify.socialToMarkdown(data.url, data.platform, data.options);
              break;
            case 'diagram-to-markdown':
              result = await markdownify.diagramToMarkdown(data.description, data.diagramType, data.data, data.options);
              break;
            default:
              throw new Error(`未知工具: ${tool}`);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ markdown: result.text, ...result }));
        } catch (error) {
          console.error('处理 /tools/xxx 路由出错:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || '无效的请求数据' }));
        }
      });
      return;
    }
    
    // 兼容老路由
    if (pathName === '/webpage' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const markdown = await markdownify.webpageToMarkdown(data.url);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ markdown }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '无效的请求数据' }));
        }
      });
      return;
    }
    
    if (pathName === '/search' && req.method === 'POST') {
      // 处理搜索查询
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const markdown = await markdownify.bingSearchToMarkdown(data.query);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ markdown }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '无效的请求数据' }));
        }
      });
      return;
    }
    
    // 默认路由 - API说明
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>Markdownify MCP HTTP Server</title></head>
        <body>
          <h1>Markdownify MCP HTTP Server</h1>
          <p>可用端点:</p>
          <ul>
            <li><code>/health</code> - 健康检查</li>
            <li><code>/youtube</code> - 将YouTube视频转换为Markdown</li>
            <li><code>/webpage</code> - 将网页转换为Markdown</li>
            <li><code>/search</code> - 将搜索查询转换为Markdown</li>
          </ul>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('服务器错误:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器内部错误' }));
  }
});

// 启动服务器
const PORT = process.env.HTTP_PORT || 3005;
server.listen(PORT, () => {
  console.log(`Markdownify MCP HTTP服务器运行在 http://localhost:${PORT}`);
});
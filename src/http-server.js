// HTTP server for Markdownify MCP
import http from 'http';
import url from 'url';
import { MarkdownifyService } from './Markdownify.js';

// 初始化Markdownify服务
const markdownify = new MarkdownifyService();

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
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
  const path = parsedUrl.pathname || '';
  
  // 处理不同的路径
  try {
    if (path === '/health') {
      // 健康检查端点
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'OK', service: 'Markdownify MCP HTTP Server' }));
      return;
    }
    
    if (path === '/youtube' && req.method === 'POST') {
      // 处理YouTube视频
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const markdown = await markdownify.youtubeToMarkdown(data.url);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ markdown }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '无效的请求数据' }));
        }
      });
      return;
    }
    
    if (path === '/webpage' && req.method === 'POST') {
      // 处理网页
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
    
    if (path === '/search' && req.method === 'POST') {
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
# Jina AI 和 MitaReader API 配置指南

## 概述

`markdownify-mcp` 服务现在支持使用 Jina AI 和 MitaReader 来抓取网页内容，特别是知乎等反爬虫网站。

## 配置方法

### 方法1：环境变量配置（推荐）

在 `markdownify-mcp` 服务启动前，设置以下环境变量：

```bash
# Jina AI API密钥
export JINA_API_KEY="your_jina_api_key_here"

# MitaReader API密钥  
export MITA_READER_API_KEY="your_mitareader_api_key_here"
```

### 方法2：数据库配置

在数据库的 `llm_configs` 表中添加配置：

```sql
-- Jina AI 配置
INSERT INTO llm_configs (title, model_name, provider, api_key, is_active) 
VALUES ('Jina AI Reader', 'jina-reader', 'jina', 'your_jina_api_key', true);

-- MitaReader 配置
INSERT INTO llm_configs (title, model_name, provider, api_key, is_active)
VALUES ('MitaReader', 'mitareader', 'mitareader', 'your_mitareader_api_key', true);
```

## 抓取策略

系统采用以下降级策略：

1. **Jina AI** - 专业网页抓取服务，支持复杂网站
2. **MitaReader** - 备用专业服务
3. **Puppeteer** - 本地浏览器自动化
4. **通用fetch** - 基础HTTP请求

## 测试

启动服务后，测试知乎网页抓取：

```bash
curl -X POST http://localhost:3005/webpage \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.zhihu.com/question/19550225","format":"markdown"}'
```

## 日志监控

查看服务日志以了解抓取过程：

```bash
# 查看markdownify-mcp服务日志
tail -f /path/to/markdownify-mcp/logs/app.log
```

日志会显示：
- 配置获取过程
- 抓取方式选择
- 成功/失败状态
- 内容长度信息

## 故障排除

### 1. API密钥未找到
- 检查环境变量是否正确设置
- 确认数据库中的配置是否正确
- 查看日志中的配置获取过程

### 2. 抓取失败
- 检查网络连接
- 确认API密钥有效
- 查看具体的错误信息

### 3. 知乎反爬虫
- 系统会自动降级到Puppeteer
- 如果仍然失败，会使用通用fetch
- 考虑使用代理或更换IP

## 性能优化

- Jina AI 和 MitaReader 通常比 Puppeteer 更快
- 对于简单网站，通用fetch已经足够
- 复杂网站建议使用专业服务

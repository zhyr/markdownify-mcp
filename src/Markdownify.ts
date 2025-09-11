import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import puppeteer from "puppeteer";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 后端API配置
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:3001';

const ZHIHU_COOKIES = [
  {
    name: 'z_c0',
    value: '_xsrf=KcZj7HQDumffoGhEHdqsbAMurGmQh2WV; _zap=e72f7bad-ffd5-4988-88a8-c677223869f3; d_c0=ASASO4FxZhmPTrVKMXmi4aV4DNzeFOP_9gk=|1729151588; z_c0=2|1:0|10:1750192716|4:z_c0|80:MS4xSEFFQUFBQUFBQUFtQUFBQVlBSlZUVXdnUDJraklIMnZ0WktpcVBVeWlCVXBxaWcyZUs3dTRBPT0=|c1c3e2e18eaf6de2a7fab0972d0390d6b4ea3d60bc6e7524d6dfa0729a637491; __zse_ck=004_i3vPNpn/KdPyvexvez7ILzE6WnGi6L0UfztNWBtvh5GuL50HZTcBflqMO7Dyp/LvYE5e7YMUijjdL/K8wmRSfYrxFYaNMeVqrjlbyZbdsqSARr0kXsHrPwHphymMJXLD-Xxf1ACRXKyqCia/x4EpOmxUiWDaDXlcySZNggHFtkOLXPVNgeuhd+aG70lLi9AIY49fipB2td1nMp935ssDWg+8dB8ANyTJn0qE6gsCXV8MQaVALmnuNa+udUEwRxfII; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1750135069,1750881738,1751262296,1751672761; HMACCOUNT=A0EE9338B152788C; BEC=32377ec81629ec05d48c98f32428ae46; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1751693067',
    domain: '.zhihu.com',
    path: '/',
    httpOnly: false,
    secure: true,
  },
  {
    name: 'z_c0',
    value: '_xsrf=AbCdEfGhIjKlMnOpQrStUvWxYz123456; _zap=abcdef12-3456-7890-abcd-ef1234567890; d_c0=BBBBB4FxZhmPTrVKMXmi4aV4DNzeFOP_9gk=|1729151599; z_c0=2|1:0|10:1750192727|4:z_c0|80:MS4xSEFFQUFBQUFBQUFtQUFBQVlBSlZUVXdnUDJraklIMnZ0WktpcVBVeWlCVXBxaWcyZUs3dTRBPT1=|c1c3e2e18eaf6de2a7fab0972d0390d6b4ea3d60bc6e7524d6dfa0729a637492; __zse_ck=005_i3vPNpn/KdPyvexvez7ILzE6WnGi6L0UfztNWBtvh5GuL50HZTcBflqMO7Dyp/LvYE5e7YMUijjdL/K8wmRSfYrxFYaNMeVqrjlbyZbdsqSARr0kXsHrPwHphymMJXLD-Xxf1ACRXKyqCia/x4EpOmxUiWDaDXlcySZNggHFtkOLXPVNgeuhd+aG70lLi9AIY49fipB2td1nMp935ssDWg+8dB8ANyTJn0qE6gsCXV8MQaVALmnuNa+udUEwRxfIJ; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1750135070,1750881739,1751262297,1751672762; HMACCOUNT=B1EE9338B152788C; BEC=42377ec81629ec05d48c98f32428ae47; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1751693068',
    domain: '.zhihu.com',
    path: '/',
    httpOnly: false,
    secure: true,
  },
  {
    name: 'z_c0',
    value: '_xsrf=ZyXwVuTsRqPoNmLkJiHgFeDcBa987654; _zap=12345678-90ab-cdef-1234-567890abcdef; d_c0=CCCCC4FxZhmPTrVKMXmi4aV4DNzeFOP_9gk=|1729151600; z_c0=2|1:0|10:1750192738|4:z_c0|80:MS4xSEFFQUFBQUFBQUFtQUFBQVlBSlZUVXdnUDJraklIMnZ0WktpcVBVeWlCVXBxaWcyZUs3dTRBPT2=|c1c3e2e18eaf6de2a7fab0972d0390d6b4ea3d60bc6e7524d6dfa0729a637493; __zse_ck=006_i3vPNpn/KdPyvexvez7ILzE6WnGi6L0UfztNWBtvh5GuL50HZTcBflqMO7Dyp/LvYE5e7YMUijjdL/K8wmRSfYrxFYaNMeVqrjlbyZbdsqSARr0kXsHrPwHphymMJXLD-Xxf1ACRXKyqCia/x4EpOmxUiWDaDXlcySZNggHFtkOLXPVNgeuhd+aG70lLi9AIY49fipB2td1nMp935ssDWg+8dB8ANyTJn0qE6gsCXV8MQaVALmnuNa+udUEwRxfIK; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1750135071,1750881740,1751262298,1751672763; HMACCOUNT=C2EE9338B152788C; BEC=52377ec81629ec05d48c98f32428ae48; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1751693069',
    domain: '.zhihu.com',
    path: '/',
    httpOnly: false,
    secure: true,
  },
  {
    name: 'z_c0',
    value: '_xsrf=1234567890abcdefABCDEFabcdef1234; _zap=abcdefab-cdef-abcd-efab-cdefabcdefab; d_c0=DDDDD4FxZhmPTrVKMXmi4aV4DNzeFOP_9gk=|1729151601; z_c0=2|1:0|10:1750192749|4:z_c0|80:MS4xSEFFQUFBQUFBQUFtQUFBQVlBSlZUVXdnUDJraklIMnZ0WktpcVBVeWlCVXBxaWcyZUs3dTRBPT3=|c1c3e2e18eaf6de2a7fab0972d0390d6b4ea3d60bc6e7524d6dfa0729a637494; __zse_ck=007_i3vPNpn/KdPyvexvez7ILzE6WnGi6L0UfztNWBtvh5GuL50HZTcBflqMO7Dyp/LvYE5e7YMUijjdL/K8wmRSfYrxFYaNMeVqrjlbyZbdsqSARr0kXsHrPwHphymMJXLD-Xxf1ACRXKyqCia/x4EpOmxUiWDaDXlcySZNggHFtkOLXPVNgeuhd+aG70lLi9AIY49fipB2td1nMp935ssDWg+8dB8ANyTJn0qE6gsCXV8MQaVALmnuNa+udUEwRxfIL; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1750135072,1750881741,1751262299,1751672764; HMACCOUNT=D3EE9338B152788C; BEC=62377ec81629ec05d48c98f32428ae49; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1751693070',
    domain: '.zhihu.com',
    path: '/',
    httpOnly: false,
    secure: true,
  },
  {
    name: 'z_c0',
    value: '_xsrf=abcdefabcdefabcdefabcdefabcdefab; _zap=abcdef12-3456-7890-abcdefabcdefabcd; d_c0=EEEEE4FxZhmPTrVKMXmi4aV4DNzeFOP_9gk=|1729151602; z_c0=2|1:0|10:1750192750|4:z_c0|80:MS4xSEFFQUFBQUFBQUFtQUFBQVlBSlZUVXdnUDJraklIMnZ0WktpcVBVeWlCVXBxaWcyZUs3dTRBPT4=|c1c3e2e18eaf6de2a7fab0972d0390d6b4ea3d60bc6e7524d6dfa0729a637495; __zse_ck=008_i3vPNpn/KdPyvexvez7ILzE6WnGi6L0UfztNWBtvh5GuL50HZTcBflqMO7Dyp/LvYE5e7YMUijjdL/K8wmRSfYrxFYaNMeVqrjlbyZbdsqSARr0kXsHrPwHphymMJXLD-Xxf1ACRXKyqCia/x4EpOmxUiWDaDXlcySZNggHFtkOLXPVNgeuhd+aG70lLi9AIY49fipB2td1nMp935ssDWg+8dB8ANyTJn0qE6gsCXV8MQaVALmnuNa+udUEwRxfIM; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1750135073,1750881742,1751262300,1751672765; HMACCOUNT=E4EE9338B152788C; BEC=72377ec81629ec05d48c98f32428ae50; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1751693071',
    domain: '.zhihu.com',
    path: '/',
    httpOnly: false,
    secure: true,
  },
];

export type MarkdownResult = {
  path: string;
  text: string;
};

export class Markdownify {
  private static async _markitdown(
    filePath: string,
    projectRoot: string,
    uvPath: string,
  ): Promise<string> {
    const venvPath = path.join(projectRoot, ".venv");
    const markitdownPath = path.join(
      venvPath, 
      process.platform === 'win32' ? 'Scripts' : 'bin', 
      `markitdown${process.platform === 'win32' ? '.exe' : ''}`
    );

    if (!fs.existsSync(markitdownPath)) {
      throw new Error("markitdown executable not found");
    }

    const { stdout, stderr } = await execAsync(
      `${uvPath} run ${markitdownPath} "${filePath}"`,
      { timeout: 8000 } // 8秒超时
    );

    if (stderr) {
      throw new Error(`Error executing command: ${stderr}`);
    }

    return stdout;
  }

  private static async saveToTempFile(content: string | Buffer, suggestedExtension?: string | null): Promise<string> {
    let outputExtension = "md";
    if (suggestedExtension != null) {
      outputExtension = suggestedExtension;
    }
    const tempOutputPath = path.join(
      os.tmpdir(),
      `markdown_output_${Date.now()}.${outputExtension}`,
    );
    fs.writeFileSync(tempOutputPath, content);
    console.log('保存临时文件:', tempOutputPath);
    return tempOutputPath;
  }

  private static normalizePath(p: string): string {
    return path.normalize(p);
  }
  
  private static expandHome(filepath: string): string {
    if (filepath.startsWith('~/') || filepath === '~') {
      return path.join(os.homedir(), filepath.slice(1));
    }
    return filepath;
  }

  static async toMarkdown({
    filePath,
    url,
    projectRoot = path.resolve(__dirname, ".."),
    uvPath = "~/.local/bin/uv",
  }: {
    filePath?: string;
    url?: string;
    projectRoot?: string;
    uvPath?: string;
  }): Promise<MarkdownResult> {
    console.log(`[Markdownify] toMarkdown called with:`, { filePath, url });
    try {
      let inputPath: string;
      let isTemporary = false;

      if (url) {
        if (url.includes("zhihu.com")) {
          console.log(`[Markdownify] 检测到知乎URL，尝试多种抓取方式: ${url}`);
          
          // 优先尝试Jina AI
          let jinaApiKey = process.env.JINA_API_KEY;
          if (!jinaApiKey) {
            jinaApiKey = await this.getApiConfig('jina');
          }
          
          if (jinaApiKey) {
            try {
              console.log(`[Markdownify] 尝试使用Jina AI抓取知乎内容`);
              const jinaContent = await this.fetchWithJinaAI(url, jinaApiKey);
              if (jinaContent && jinaContent.length > 50) {
                const path = await this.saveToTempFile(jinaContent, "md");
                console.log(`[Markdownify] Jina AI抓取成功，内容长度: ${jinaContent.length}`);
                return { path, text: jinaContent };
              }
            } catch (e) {
              console.log(`[Markdownify] Jina AI抓取失败，尝试MitaReader: ${e}`);
            }
          }
          
          // 尝试MitaReader
          let mitaApiKey = process.env.MITA_READER_API_KEY;
          if (!mitaApiKey) {
            mitaApiKey = await this.getApiConfig('mitareader');
          }
          
          if (mitaApiKey) {
            try {
              console.log(`[Markdownify] 尝试使用MitaReader抓取知乎内容`);
              const mitaContent = await this.fetchWithMitaReader(url, mitaApiKey);
              if (mitaContent && mitaContent.length > 50) {
                const path = await this.saveToTempFile(mitaContent, "md");
                console.log(`[Markdownify] MitaReader抓取成功，内容长度: ${mitaContent.length}`);
                return { path, text: mitaContent };
              }
            } catch (e) {
              console.log(`[Markdownify] MitaReader抓取失败，尝试Puppeteer: ${e}`);
            }
          }
          
          // 最后尝试Puppeteer
          try {
            console.log(`[Markdownify] 尝试使用Puppeteer抓取知乎内容`);
            const zhihuText = await this.fetchZhihuArticleWithPuppeteer(url);
            console.log(`[Markdownify] Puppeteer抓取结果长度: ${zhihuText?.length || 0}`);
            if (zhihuText && zhihuText.length > 20) {
              const path = await this.saveToTempFile(zhihuText, "md");
              console.log(`[Markdownify] Puppeteer抓取成功`);
              return { path, text: zhihuText };
            } else {
              console.log(`[Markdownify] Puppeteer抓取内容过短，降级为fetch`);
            }
          } catch (e) {
            console.error("puppeteer 抓取知乎失败，降级为 fetch:", e);
            // 可降级为 fetch+Cookie 方案
          }
        }
        
        // 检测微信公众号，使用Puppeteer处理
        if (url.includes('mp.weixin.qq.com')) {
          console.log(`[Markdownify] 检测到微信公众号，使用Puppeteer处理: ${url}`);
          try {
            const wechatText = await this.fetchWeChatArticleWithPuppeteer(url);
            console.log(`[Markdownify] Puppeteer抓取微信公众号结果长度: ${wechatText?.length || 0}`);
            if (wechatText && wechatText.length > 20) {
              const path = await this.saveToTempFile(wechatText, "md");
              console.log(`[Markdownify] Puppeteer抓取微信公众号成功`);
              return { path, text: wechatText };
            } else {
              console.log(`[Markdownify] Puppeteer抓取微信公众号内容过短，降级为markitdown`);
            }
          } catch (e) {
            console.error("puppeteer 抓取微信公众号失败，降级为 markitdown:", e);
          }
        }
        
        // 检测Haxitag网站（Next.js应用）
        if (url.includes('haxitag.com')) {
          console.log(`[Markdownify] 检测到Haxitag网站，使用特殊处理: ${url}`);
          try {
            const haxitagText = await this.fetchHaxitagContent(url);
            if (haxitagText && haxitagText.length > 50) {
              const path = await this.saveToTempFile(haxitagText, "md");
              console.log(`[Markdownify] Haxitag内容提取成功`);
              return { path, text: haxitagText };
            } else {
              console.log(`[Markdownify] Haxitag内容提取失败，降级为 markitdown`);
            }
          } catch (error) {
            console.log(`[Markdownify] Haxitag内容提取失败，降级为 markitdown: ${error}`);
          }
        }
        
        // 检测移动端分享页面，使用Puppeteer处理
        if (url.includes('h.xinhuaxmt.com') || url.includes('/share/') || 
            (url.includes('m.') && (url.includes('news.cn') || url.includes('xinhua')))) {
          console.log(`[Markdownify] 检测到移动端分享页面，使用Puppeteer处理: ${url}`);
          try {
            const sharePageText = await this.fetchZhihuArticleWithPuppeteer(url);
            console.log(`[Markdownify] Puppeteer抓取分享页面结果长度: ${sharePageText?.length || 0}`);
            if (sharePageText && sharePageText.length > 20) {
              const path = await this.saveToTempFile(sharePageText, "md");
              console.log(`[Markdownify] Puppeteer抓取分享页面成功`);
              return { path, text: sharePageText };
            } else {
              console.log(`[Markdownify] Puppeteer抓取分享页面内容过短，降级为markitdown`);
            }
          } catch (e) {
            console.error("puppeteer 抓取分享页面失败，降级为 markitdown:", e);
          }
        }
        if (this.isYouTubeUrl(url)) {
          return await this.youtubeToMarkdown(url);
        }
        if (this.isPodcastUrl(url)) {
          return await this.podcastToMarkdown(url);
        }
      let response;
      try {
        response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            "Referer": url,
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
          },
          signal: AbortSignal.timeout(15000) // 增加到15秒超时
        });
      } catch (fetchError) {
        console.error(`[Markdownify] fetch失败: ${fetchError}`);
        // 如果是超时错误，尝试使用fallback
        if (fetchError instanceof Error && fetchError.name === 'TimeoutError') {
          console.log(`[Markdownify] 超时，使用fallback处理: ${url}`);
          const fallbackText = this.simpleHtmlToText(`<html><head><title>页面超时</title></head><body><h1>页面加载超时</h1><p>无法获取 ${url} 的内容，请稍后重试。</p></body></html>`);
          return { text: fallbackText, path: "" };
        }
        throw new Error(`无法获取网页内容: ${fetchError instanceof Error ? fetchError.message : '网络错误'}`);
      }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let extension = "html";
        if (url.endsWith(".pdf")) {
          extension = "pdf";
        }
        const arrayBuffer = await response.arrayBuffer();
        const content = Buffer.from(arrayBuffer);
        inputPath = await this.saveToTempFile(content, extension);
        isTemporary = true;
      } else if (filePath) {
        inputPath = filePath;
      } else {
        throw new Error("Either filePath or url must be provided");
      }

      let text: string;
      try {
        text = await this._markitdown(inputPath, projectRoot, uvPath);
        console.log(`[Markdownify] markitdown处理完成，结果长度: ${text.length}`);
      } catch (markitdownError) {
        console.error(`[Markdownify] markitdown处理失败: ${markitdownError}`);
        // 使用简单的HTML到文本转换作为fallback
        const htmlContent = fs.readFileSync(inputPath, 'utf-8');
        text = this.simpleHtmlToText(htmlContent);
        console.log(`[Markdownify] 使用fallback处理，结果长度: ${text.length}`);
        
        // 确保fallback结果不为空
        if (!text || text.trim().length < 10) {
          text = "无法提取网页内容，请检查链接是否有效。";
        }
      }
      
      // 对网页内容进行智能过滤，提取核心内容
      if (url) {
        text = this.filterWebpageContent(text, url);
      }
      
      const outputPath = await this.saveToTempFile(text);

      if (isTemporary) {
        fs.unlinkSync(inputPath);
      }

      return { path: outputPath, text: text };
    } catch (e: unknown) {
      console.error("toMarkdown error:", e);
      if (e instanceof Error) {
        throw new Error(`Error processing to Markdown: ${e.message}`);
      } else {
        throw new Error("Error processing to Markdown: Unknown error occurred");
      }
    }
  }

  static async get({
    filePath,
  }: {
    filePath: string;
  }): Promise<MarkdownResult> {
    // Check file type is *.md or *.markdown
    const normPath = this.normalizePath(path.resolve(this.expandHome(filePath)));
    const markdownExt = [".md", ".markdown"];
    if (!markdownExt.includes(path.extname(normPath))){
      throw new Error("Required file is not a Markdown file.");
    }

    if (process.env?.MD_SHARE_DIR) {
      const allowedShareDir = this.normalizePath(path.resolve(this.expandHome(process.env.MD_SHARE_DIR)));
      if (!normPath.startsWith(allowedShareDir)) {
        throw new Error(`Only files in ${allowedShareDir} are allowed.`);
      }
    }

    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }

    const text = await fs.promises.readFile(filePath, "utf-8");

    return {
      path: filePath,
      text: text,
    };
  }

  static async bingSearchToMarkdown(query: string): Promise<MarkdownResult> {
    // 这里应集成真实的 Bing 搜索转 Markdown 逻辑，暂返回模拟内容
    const text = `# Bing 搜索结果\n\n查询: ${query}\n\n- 示例结果 1\n- 示例结果 2`;
    const path = await this.saveToTempFile(text);
    return { path, text };
  }

  static async socialToMarkdown(url: string, platform: string, options?: any): Promise<MarkdownResult> {
    // 这里应集成真实的社交媒体转 Markdown 逻辑，暂返回模拟内容
    const text = `# 社交媒体内容\n\n平台: ${platform}\nURL: ${url}\n\n- 示例内容 1\n- 示例内容 2`;
    const path = await this.saveToTempFile(text);
    return { path, text };
  }

  static isYouTubeUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return (
        u.hostname.includes('youtube.com') ||
        u.hostname.includes('youtu.be')
      );
    } catch {
      return false;
    }
  }

  static isPodcastUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return (
        u.hostname.includes('podcast') ||
        u.hostname.includes('podcasts.apple.com') ||
        u.hostname.includes('open.spotify.com') ||
        u.hostname.includes('ximalaya.com')
      );
    } catch {
      return false;
    }
  }

  static async youtubeToMarkdown(url: string): Promise<MarkdownResult> {
    // ... mock 实现 ...
    const text = `# YouTube视频: ${url}\n\n...`;
    const path = await this.saveToTempFile(text);
    return { path, text };
  }

  static async podcastToMarkdown(url: string): Promise<MarkdownResult> {
    // ... mock 实现 ...
    const text = `# Podcast节目: ${url}\n\n...`;
    const path = await this.saveToTempFile(text);
    return { path, text };
  }


  /**
   * 从后端获取API配置
   */
  static async getApiConfig(provider: string): Promise<string | null> {
    try {
      console.log(`[Config] 尝试获取${provider}配置`);
      
      // 直接通过SQL查询数据库获取API密钥
      const apiKey = await this.queryDatabaseForApiKey(provider);
      if (apiKey) {
        console.log(`[Config] 从数据库找到${provider}配置`);
        return apiKey;
      }
      
      console.log(`[Config] 未找到${provider}配置`);
      return null;
    } catch (error) {
      console.log(`[Config] 获取${provider}配置失败: ${error}`);
      return null;
    }
  }

  /**
   * 通过SQL查询数据库获取API密钥
   */
  static async queryDatabaseForApiKey(provider: string): Promise<string | null> {
    try {
      console.log(`[Config] 查询数据库获取${provider}配置`);
      
      // 优先尝试通过环境变量获取数据库连接信息
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || '5432';
      const dbUser = process.env.DB_USER || 'yueliapp';
      const dbName = process.env.DB_NAME || 'yuelideck';
      const dbPassword = process.env.DB_PASSWORD || '';
      
      // 构建psql连接字符串
      const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
      const command = `psql "${connectionString}" -t -c "SELECT api_key FROM llm_configs WHERE (provider ILIKE '%${provider}%' OR model_name ILIKE '%${provider}%' OR title ILIKE '%${provider}%') AND is_active = true AND api_key IS NOT NULL LIMIT 1;"`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.log(`[Config] 数据库查询错误: ${stderr}`);
        return null;
      }
      
      const apiKey = stdout.trim();
      if (apiKey && apiKey !== '') {
        console.log(`[Config] 从数据库获取到${provider}配置`);
        return apiKey;
      }
      
      return null;
    } catch (error) {
      console.log(`[Config] 数据库查询失败: ${error}`);
      return null;
    }
  }

  /**
   * 使用Jina AI抓取网页内容
   */
  static async fetchWithJinaAI(url: string, apiKey: string): Promise<string> {
    try {
      console.log(`[Jina AI] 开始抓取网页: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`https://r.jina.ai/${url}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Return-Format': 'text'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Jina AI请求失败: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log(`[Jina AI] 抓取成功，内容长度: ${content.length}`);
      return content;
    } catch (error) {
      console.error(`[Jina AI] 抓取失败: ${error}`);
      throw error;
    }
  }

  /**
   * 使用mitareader抓取网页内容
   */
  static async fetchWithMitaReader(url: string, apiKey: string): Promise<string> {
    try {
      console.log(`[MitaReader] 开始抓取网页: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('https://api.mitareader.com/v1/extract', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          format: 'markdown'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`MitaReader请求失败: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      const content = result.content || result.text || '';
      console.log(`[MitaReader] 抓取成功，内容长度: ${content.length}`);
      return content;
    } catch (error) {
      console.error(`[MitaReader] 抓取失败: ${error}`);
      throw error;
    }
  }

  /**
   * 智能过滤网页内容，提取核心信息
   */
  static filterWebpageContent(content: string, url: string): string {
    console.log(`[ContentFilter] 开始过滤网页内容，原始长度: ${content.length}`);
    
    // 如果内容太长，先截取前50000字符进行过滤
    if (content.length > 50000) {
      console.log(`[ContentFilter] 内容过长，先截取前50000字符进行过滤`);
      content = content.substring(0, 50000) + '\n\n...（内容已截取）';
    }
    
    // 如果内容太短，直接返回
    if (content.length < 50) {
      console.log(`[ContentFilter] 内容太短，直接返回原始内容`);
      return content;
    }
    
    // 移除常见的无用内容
    let filteredContent = content;
    
    // 1. 移除网页解析标记和浏览器警告
    const headerPatterns = [
      /浏览访问URL.*?--- 解析结束 ---/gs,
      /您正在使用IE低版浏览器.*?强烈建议使用更快更安全的浏览器/gs,
      /--- 网页内容解析 ---/gs,
      /字体: 小 中 大 分享到:.*?新华网/gs,
    ];
    
    headerPatterns.forEach(pattern => {
      filteredContent = filteredContent.replace(pattern, '');
    });
    
    // 2. 移除导航菜单和链接列表（只移除明显的导航内容）
    const navigationPatterns = [
      /雷峰网公开课.*?爱搞机/gs,
      /业界.*?智能驾驶/gs,
      /数智化.*?城市数智化/gs,
      /金融科技.*?生物医药/gs,
      /芯片.*?智慧地产/gs,
      /行业云.*?工业转型实践/gs,
      /AIoT.*?智能家居/gs,
      /当月热门文章.*?最新文章/gs,
      /热门搜索.*?意见反馈/gs,
      /联系我们.*?粤ICP备/gs,
      /请填写申请人资料.*?以后再说/gs,
      /为了您的账户安全.*?立即设置/gs,
    ];
    
    navigationPatterns.forEach(pattern => {
      filteredContent = filteredContent.replace(pattern, '');
    });
    
    // 3. 移除图片链接
    const imageUrlPattern = /!\[.*?\]\(https?:\/\/[^)]+\.(jpg|jpeg|png|gif|webp|svg)[^)]*\)/gi;
    filteredContent = filteredContent.replace(imageUrlPattern, '');
    
    // 4. 移除明显的链接列表（但保留文章内的链接文本）
    const linkListPatterns = [
      /新华全媒头条.*?深度观察/gs,
      /新华全媒\+.*?深度观察/gs,
      /港澳连线.*?深度观察/gs,
      /全球连线.*?深度观察/gs,
      /国际观察.*?深度观察/gs,
      /列国鉴.*?深度观察/gs,
      /热点问答.*?深度观察/gs,
      /险境中的告白.*?深度观察/gs,
      /西北探.*?深度观察/gs,
    ];
    
    linkListPatterns.forEach(pattern => {
      filteredContent = filteredContent.replace(pattern, '');
    });
    
    // 5. 移除版权信息和页脚
    const footerPatterns = [
      /Copyright.*?版权所有.*?粤ICP备/gs,
      /办公电话.*?七牛云/gs,
      /下载雷峰网客户端.*?Android/gs,
      /纠错.*?责任编辑/gs,
      /阅读下一篇.*?深度观察/gs,
    ];
    
    footerPatterns.forEach(pattern => {
      filteredContent = filteredContent.replace(pattern, '');
    });
    
    // 6. 移除时间戳和来源信息
    const metadataPatterns = [
      /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+来源:.*?/g,
      /本文作者:.*?\|/g,
      /记者.*?【纠错】/g,
    ];
    
    metadataPatterns.forEach(pattern => {
      filteredContent = filteredContent.replace(pattern, '');
    });
    
    // 7. 提取核心文章内容
    const lines = filteredContent.split('\n');
    const coreLines: string[] = [];
    let inArticle = false;
    let articleStartFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 跳过空行和过短的行
      if (line.length < 5) continue;
      
      // 检测文章开始（标题或核心内容）
      if (!articleStartFound && (
        line.match(/^#\s+.+/) || // 主标题
        line.match(/本文作者/) || // 作者信息
        line.match(/导语/) || // 导语
        line.match(/^新问界M7/) || // 特定文章标题
        line.match(/^鸿蒙智行/) || // 特定内容
        line.match(/^《.*?》/) || // 书名号标题
        line.match(/^2024.*?报告/) || // 报告标题
        line.match(/^清华大学/) || // 机构名称
        line.match(/^中国工程院/) || // 机构名称
        line.match(/^新华社/) || // 新华社
        line.match(/^新华网/) || // 新华网
        line.match(/^记者/) || // 记者
        line.match(/^来源/) || // 来源
        line.match(/^编辑/) || // 编辑
        line.match(/^责任编辑/) || // 责任编辑
        line.match(/^发布时间/) || // 发布时间
        line.match(/^发布时间/) || // 发布时间
        line.match(/^[0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日/) || // 日期格式
        line.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/) // 日期格式
      )) {
        articleStartFound = true;
        inArticle = true;
      }
      
      // 检测文章结束
      if (inArticle && (
        line.match(/雷峰网原创文章/) ||
        line.match(/未经授权禁止转载/) ||
        line.match(/相关文章/) ||
        line.match(/分享：/) ||
        line.match(/0人收藏/) ||
        line.match(/【纠错】/) ||
        line.match(/责任编辑/) ||
        line.match(/阅读下一篇/) ||
        line.match(/深度观察/) ||
        line.match(/分享到/) ||
        line.match(/收藏/) ||
        line.match(/点赞/)
      )) {
        break;
      }
      
      if (inArticle && line.length > 0) {
        // 更宽松的过滤：只移除明显的链接行
        if (!line.match(/^https?:\/\//) && !line.match(/^www\./)) {
          coreLines.push(line);
        }
      }
    }
    
    // 如果没有找到文章结构，尝试提取主要内容段落
    if (coreLines.length < 3) {
      const mainContentLines = lines.filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 5 && // 降低长度要求到5字符
               !trimmed.match(/^\[/) && // 不是链接
               !trimmed.match(/^!\[/) && // 不是图片
               !trimmed.match(/^[*-]\s*\[/) && // 不是列表项链接
               !trimmed.match(/^[0-9]+\.\s*\[/) && // 不是编号列表链接
               !trimmed.match(/^[A-Za-z\s]+$/) && // 不是纯英文
               !trimmed.match(/^[0-9\s-]+$/) && // 不是纯数字
               !trimmed.match(/^https?:\/\//) && // 不是URL
               !trimmed.match(/^www\./) && // 不是www链接
               !trimmed.match(/新华全媒|港澳连线|全球连线|国际观察|列国鉴|热点问答|险境中的告白|西北探|深度观察/); // 不包含导航关键词
      });
      
      coreLines.push(...mainContentLines.slice(0, 50)); // 增加到50行
    }
    
    // 如果仍然没有内容，返回原始内容的简化版本
    if (coreLines.length === 0) {
      console.log(`[ContentFilter] 警告：所有内容都被过滤，返回原始内容的前2000字符`);
      const fallbackContent = content.substring(0, 2000);
      return fallbackContent + (content.length > 2000 ? '\n\n...（内容已截取）' : '');
    }
    
    // 8. 清理和格式化内容
    let finalContent = coreLines.join('\n\n');
    
    // 移除多余的空行
    finalContent = finalContent.replace(/\n{3,}/g, '\n\n');
    
    // 移除行首行尾空白
    finalContent = finalContent.split('\n').map(line => line.trim()).join('\n');
    
    // 移除重复的标题
    finalContent = finalContent.replace(/(.+)\n\1/g, '$1');
    
    // 如果内容仍然太长，截取前8000字符
    if (finalContent.length > 8000) {
      finalContent = finalContent.substring(0, 8000) + '\n\n...（内容已截取）';
    }
    
    console.log(`[ContentFilter] 过滤完成，最终长度: ${finalContent.length}`);
    
    return finalContent.trim();
  }

  static async fetchWeChatArticleWithPuppeteer(url: string): Promise<string> {
    let browser;
    try {
      console.log(`[Puppeteer] 开始启动浏览器抓取微信公众号...`);
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });

      const page = await browser.newPage();
      
      // 设置微信公众号专用的请求头
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      });

      // 设置视口
      await page.setViewport({ width: 1920, height: 1080 });

      console.log(`[Puppeteer] 正在访问微信公众号: ${url}`);
      
      // 访问页面并等待内容加载
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', // 改为更快的等待条件
        timeout: 8000 // 进一步减少超时时间到8秒
      });

      // 等待文章内容加载
      await new Promise(resolve => setTimeout(resolve, 500)); // 减少等待时间

      // 尝试等待文章标题或内容区域
      try {
        await page.waitForSelector('#js_content, .rich_media_content, .rich_media_title', { timeout: 10000 });
      } catch (e) {
        console.log(`[Puppeteer] 未找到预期的内容选择器，继续提取`);
      }

      // 提取文章内容
      const content = await page.evaluate(() => {
        // 移除脚本和样式
        const scripts = document.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());

        // 尝试多种选择器来获取文章内容
        let articleContent = '';
        
        // 尝试获取文章标题
        const titleSelectors = [
          '#activity-name',
          '.rich_media_title',
          'h1',
          '.title'
        ];
        
        for (const selector of titleSelectors) {
          const titleEl = document.querySelector(selector);
          if (titleEl && titleEl.textContent?.trim()) {
            articleContent += `# ${titleEl.textContent.trim()}\n\n`;
            break;
          }
        }

        // 尝试获取文章正文
        const contentSelectors = [
          '#js_content',
          '.rich_media_content',
          '.content',
          'article',
          '.post-content'
        ];

        for (const selector of contentSelectors) {
          const contentEl = document.querySelector(selector);
          if (contentEl) {
            // 清理内容
            const text = contentEl.textContent || (contentEl as HTMLElement).innerText || '';
            if (text.trim().length > 100) {
              articleContent += text.trim();
              break;
            }
          }
        }

        // 如果没有找到内容，尝试获取整个页面的文本
        if (!articleContent || articleContent.length < 100) {
          const bodyText = document.body.textContent || (document.body as HTMLElement).innerText || '';
          if (bodyText.trim().length > 100) {
            articleContent = bodyText.trim();
          }
        }

        return articleContent;
      });

      console.log(`[Puppeteer] 微信公众号内容提取完成，长度: ${content?.length || 0}`);
      
      if (content && content.length > 50) {
        return content;
      } else {
        throw new Error('未能提取到有效的文章内容');
      }

    } catch (error) {
      console.error(`[Puppeteer] 微信公众号抓取失败: ${error}`);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private static simpleHtmlToText(htmlContent: string): string {
    // 改进的HTML到文本转换
    let text = htmlContent
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<noscript[^>]*>.*?<\/noscript>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    // 如果内容太短，尝试提取更多信息
    if (text.length < 50) {
      // 尝试提取title
      const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch) {
        text = `标题: ${titleMatch[1].trim()}\n\n${text}`;
      }
      
      // 尝试提取meta description
      const descMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      if (descMatch) {
        text += `\n\n描述: ${descMatch[1].trim()}`;
      }
    }
    
    return text;
  }

  static async fetchHaxitagContent(url: string): Promise<string> {
    try {
      console.log(`[Haxitag] 开始提取Haxitag内容: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1"
        },
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // 提取__NEXT_DATA__中的内容
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
      if (!nextDataMatch) {
        throw new Error('未找到__NEXT_DATA__');
      }
      
      const nextData = JSON.parse(nextDataMatch[1]);
      const postData = nextData?.props?.pageProps?.post;
      
      if (!postData) {
        throw new Error('未找到文章数据');
      }
      
      // 构建Markdown内容
      let markdown = `# ${postData.title}\n\n`;
      
      if (postData.description) {
        markdown += `**描述**: ${postData.description}\n\n`;
      }
      
      if (postData.date) {
        markdown += `**发布时间**: ${new Date(postData.date).toLocaleDateString('zh-CN')}\n\n`;
      }
      
      if (postData.category && postData.category.length > 0) {
        markdown += `**分类**: ${postData.category.join(', ')}\n\n`;
      }
      
      if (postData.tags && postData.tags.length > 0) {
        markdown += `**标签**: ${postData.tags.join(', ')}\n\n`;
      }
      
      if (postData.body?.raw) {
        markdown += `## 正文\n\n${postData.body.raw}\n\n`;
      }
      
      console.log(`[Haxitag] 内容提取完成，长度: ${markdown.length}`);
      return markdown;
      
    } catch (error) {
      console.error(`[Haxitag] 内容提取失败: ${error}`);
      throw error;
    }
  }

  static async fetchZhihuArticleWithPuppeteer(url: string): Promise<string> {
    let browser;
    try {
      console.log(`[Puppeteer] 开始启动浏览器...`);
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
        ],
      });
      console.log(`[Puppeteer] 浏览器启动成功，创建新页面...`);
      const page = await browser.newPage();

      // 设置更真实的浏览器环境
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // 随机选一个 Cookie 并修复格式
      const cookie = ZHIHU_COOKIES[Math.floor(Math.random() * ZHIHU_COOKIES.length)];
      console.log(`[Puppeteer] 设置Cookie: ${cookie.name}`);
      
      // 修复Cookie格式，确保所有必需字段都存在
      const fixedCookie = {
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path || '/',
        httpOnly: cookie.httpOnly || false,
        secure: cookie.secure || true,
        sameSite: 'Lax' as const
      };
      
      try {
        await page.setCookie(fixedCookie);
        console.log(`[Puppeteer] Cookie设置成功`);
      } catch (cookieError) {
        console.log(`[Puppeteer] Cookie设置失败，继续无Cookie访问: ${cookieError}`);
        // 继续执行，不使用Cookie
      }

      console.log(`[Puppeteer] 开始抓取知乎页面: ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });
      
      // 等待页面加载完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 智能内容提取
      const content = await page.evaluate(() => {
        // 提取页面标题
        const title = document.querySelector('h1')?.textContent?.trim() || 
                     document.querySelector('.QuestionHeader-title')?.textContent?.trim() ||
                     document.querySelector('.Post-Title')?.textContent?.trim() ||
                     document.title;

        // 提取问题内容（针对问题页面）
        const questionContent = document.querySelector('.QuestionRichText')?.textContent?.trim() ||
                               document.querySelector('.QuestionHeader-detail')?.textContent?.trim();

        // 提取回答内容（针对回答页面）
        const answerContent = document.querySelector('.RichContent-inner')?.textContent?.trim() ||
                             document.querySelector('.AnswerItem .RichContent')?.textContent?.trim();

        // 提取文章内容（针对专栏文章）
        const articleContent = document.querySelector('.Post-RichTextContainer')?.textContent?.trim() ||
                              document.querySelector('.Post-RichText')?.textContent?.trim();

        // 提取通用内容
        const generalContent = document.querySelector('.RichText.ztext')?.textContent?.trim() ||
                              document.querySelector('.ContentItem')?.textContent?.trim();

        // 提取作者信息
        const author = document.querySelector('.AuthorInfo-name')?.textContent?.trim() ||
                      document.querySelector('.UserLink-link')?.textContent?.trim();

        // 提取点赞数等信息
        const voteCount = document.querySelector('.VoteButton--up')?.textContent?.trim() ||
                         document.querySelector('.Button--withIcon')?.textContent?.trim();

        // 构建完整内容
        let fullContent = '';
        
        if (title) {
          fullContent += `# ${title}\n\n`;
        }
        
        if (author) {
          fullContent += `**作者**: ${author}\n\n`;
        }
        
        if (questionContent) {
          fullContent += `## 问题\n\n${questionContent}\n\n`;
        }
        
        if (answerContent) {
          fullContent += `## 回答\n\n${answerContent}\n\n`;
        }
        
        if (articleContent) {
          fullContent += `## 文章内容\n\n${articleContent}\n\n`;
        }
        
        if (generalContent && !answerContent && !articleContent) {
          fullContent += `## 内容\n\n${generalContent}\n\n`;
        }
        
        if (voteCount) {
          fullContent += `**点赞数**: ${voteCount}\n\n`;
        }

        // 如果没有提取到任何内容，尝试提取body中的文本
        if (!fullContent.trim()) {
          const bodyText = document.body?.textContent?.trim();
          if (bodyText && bodyText.length > 100) {
            fullContent = `# 知乎内容\n\n${bodyText.substring(0, 5000)}...`;
          }
        }

        return fullContent.trim();
      });

      console.log(`[Puppeteer] 内容提取完成，长度: ${content.length}`);
      
      if (content && content.length > 50) {
        return content;
      } else {
        throw new Error('内容提取失败或内容过短');
      }

    } catch (error) {
      console.error(`[Puppeteer] 抓取失败: ${error}`);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
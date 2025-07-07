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
          try {
            const zhihuText = await this.fetchZhihuArticleWithPuppeteer(url);
            if (zhihuText && zhihuText.length > 20) {
              const path = await this.saveToTempFile(zhihuText, "md");
              return { path, text: zhihuText };
            }
          } catch (e) {
            console.error("puppeteer 抓取知乎失败，降级为 fetch:", e);
            // 可降级为 fetch+Cookie 方案
          }
        }
        if (this.isYouTubeUrl(url)) {
          return await this.youtubeToMarkdown(url);
        }
        if (this.isPodcastUrl(url)) {
          return await this.podcastToMarkdown(url);
        }
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            "Referer": url,
            "Accept-Language": "zh-CN,zh;q=0.9"
          }
        });
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

      const text = await this._markitdown(inputPath, projectRoot, uvPath);
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

  static async fetchZhihuArticleWithPuppeteer(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    });
    const page = await browser.newPage();

    // 随机选一个 Cookie
    const cookie = ZHIHU_COOKIES[Math.floor(Math.random() * ZHIHU_COOKIES.length)];
    await page.setCookie(cookie);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector('.Post-RichTextContainer, .RichText.ztext', { timeout: 15000 });
    const content = await page.evaluate(() => {
      const el = document.querySelector('.Post-RichTextContainer, .RichText.ztext');
      return el ? (el as HTMLElement).innerText : '';
    });
    await browser.close();
    return content;
  }
}
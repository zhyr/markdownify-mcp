import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const markitdownPath = path.join(venvPath, "bin", "markitdown");

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

  private static async saveToTempFile(content: string): Promise<string> {
    const tempOutputPath = path.join(
      os.tmpdir(),
      `markdown_output_${Date.now()}.md`,
    );
    fs.writeFileSync(tempOutputPath, content);
    return tempOutputPath;
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
        const response = await fetch(url);
        const content = await response.text();
        inputPath = await this.saveToTempFile(content);
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

      return { path: outputPath, text };
    } catch (e: unknown) {
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

  static async diagramToMarkdown(description: string, diagramType: string, data?: any, options?: any): Promise<MarkdownResult> {
    // 这里应集成真实的图表转 Markdown 逻辑，暂返回模拟 mermaid 图
    const text = `# 图表 (${diagramType})\n\n\`\`\`mermaid\nflowchart TB\n  A[开始] --> B[结束]\n\`\`\``;
    const path = await this.saveToTempFile(text);
    return { path, text };
  }

  static async pdfToMarkdown({ filePath }: { filePath: string }) {
    if (!fs.existsSync(filePath)) throw new Error('File not found: ' + filePath);
    return await this.toMarkdown({ filePath });
  }
}

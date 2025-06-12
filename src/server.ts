import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Markdownify } from "./Markdownify.js";
import * as tools from "./tools.js";
import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

const RequestPayloadSchema = z.object({
  filepath: z.string().optional(),
  url: z.string().optional(),
  projectRoot: z.string().optional(),
  uvPath: z.string().optional(),
});

export function createServer() {
  const server = new Server(
    {
      name: "mcp-markdownify-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Object.values(tools),
    };
  });

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      console.log(`[MCP] 收到工具调用: ${name}, 参数:`, args);

      const validatedArgs = RequestPayloadSchema.parse(args);

      try {
        let result;
        switch (name) {
          case tools.YouTubeToMarkdownTool.name:
          case tools.BingSearchResultToMarkdownTool.name:
          case tools.WebpageToMarkdownTool.name:
            if (!validatedArgs.url) {
              throw new Error("URL is required for this tool");
            }
            result = await Markdownify.toMarkdown({
              url: validatedArgs.url,
              projectRoot: validatedArgs.projectRoot,
              uvPath: validatedArgs.uvPath || process.env.UV_PATH,
            });
            break;

          case tools.PDFToMarkdownTool.name:
          case tools.ImageToMarkdownTool.name:
          case tools.AudioToMarkdownTool.name:
          case tools.DocxToMarkdownTool.name:
          case tools.XlsxToMarkdownTool.name:
          case tools.PptxToMarkdownTool.name:
            if (!validatedArgs.filepath) {
              throw new Error("File path is required for this tool");
            }
            result = await Markdownify.toMarkdown({
              filePath: validatedArgs.filepath,
              projectRoot: validatedArgs.projectRoot,
              uvPath: validatedArgs.uvPath || process.env.UV_PATH,
            });
            break;

          case tools.GetMarkdownFileTool.name:
            if (!validatedArgs.filepath) {
              throw new Error("File path is required for this tool");
            }
            result = await Markdownify.get({
              filePath: validatedArgs.filepath,
            });
            break;

          default:
            throw new Error("Tool not found");
        }

        return {
          content: [
            { type: "text", text: `Output file: ${result.path}` },
            { type: "text", text: `Converted content:` },
            { type: "text", text: result.text },
          ],
          isError: false,
        };
      } catch (e) {
        if (e instanceof Error) {
          return {
            content: [{ type: "text", text: `Error: ${e.message}` }],
            isError: true,
          };
        } else {
          console.error(e);
          return {
            content: [{ type: "text", text: `Error: Unknown error occurred` }],
            isError: true,
          };
        }
      }
    },
  );

  return server;
}

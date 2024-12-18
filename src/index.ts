#!/usr/bin/env node

/**
MCPs support
- prompts
- resources
*/

import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { OCRFile, OCROutFilePath, OCRProcessor } from "./OCRProcessor.js";

const server = new Server(
  {
    name: "mcp-boilerplace",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "ocr-pdf",
        description: "OCR a PDF file",
        inputSchema: {
          type: "object",
          properties: {
            filepath: {
              type: "string",
              description: "Path to file to OCR",
            },
          },
          required: ["filepath"],
        },
      },
      {
        name: "get-ocr-file",
        description: "Get the content of an OCR'd file",
        inputSchema: {
          type: "object",
          properties: {
            filepath: {
              type: "string",
              description: "Path to file of OCR'd text",
            },
          },
          required: ["filepath"],
        },
      },
    ],
  };
});

const RequestPayloadSchema = z.object({
  filepath: z.string(),
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const validatedArgs = RequestPayloadSchema.parse(args);

  if (name === "ocr-pdf") {
    try {
      const outFile: OCROutFilePath = await OCRProcessor.ocr({
        filePath: validatedArgs.filepath,
      });
      return {
        content: [{ type: "text", text: `OCRd File Path ${outFile.path}` }],
        isError: false,
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  }

  if (name === "get-ocr-file") {
    try {
      const outFile: OCRFile = await OCRProcessor.get({
        filePath: validatedArgs.filepath,
      });
      return {
        content: [
          { type: "text", text: `Cleaned File Path ${outFile.path}` },
          { type: "text", text: `${outFile.text}` },
        ],
        isError: false,
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  }

  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Boilerplate MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

import { createWorker } from "tesseract.js";
import path from "path";
import fs from "fs";
import os from "os";

export type OCROutFilePath = {
  path: string;
};

export type OCRFile = {
  path: string;
  text: string;
};

export class OCRProcessor {
  static async ocr({ filePath }: { filePath: string }) {
    let worker: Tesseract.Worker | null = null;

    try {
      worker = await createWorker("eng");
      const tempOutputPath = path.join(
        os.tmpdir(),
        `ocr_output_${Date.now()}.txt`,
      );

      const {
        data: { text },
      } = await worker.recognize(filePath);
      fs.writeFileSync(tempOutputPath, text);

      return {
        path: tempOutputPath,
      } as OCROutFilePath;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new Error(`Error processing OCR: ${e.message}`);
      } else {
        throw new Error("Error processing OCR: Unknown error occurred");
      }
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }

  static async get({ filePath }: { filePath: string }) {
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }

    const text = fs.readFileSync(filePath);

    return {
      path: filePath,
      text: text.toString(),
    } as OCRFile;
  }
}

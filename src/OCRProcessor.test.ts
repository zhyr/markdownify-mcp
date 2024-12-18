import { OCRProcessor } from "./OCRProcessor";
import fs from "fs";
import os from "os";
import path from "path";

jest.mock("tesseract.js", () => ({
  createWorker: jest.fn().mockResolvedValue({
    recognize: jest
      .fn()
      .mockResolvedValue({ data: { text: "Mocked OCR text" } }),
    terminate: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe("OCRProcessor", () => {
  const mockFilePath = "/path/to/mock/file.pdf";
  const mockOutputPath = path.join(os.tmpdir(), "ocr_output_12345.txt");

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(12345);
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(Buffer.from("Mocked file content"));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("ocr", () => {
    it("should process OCR and return output file path", async () => {
      const result = await OCRProcessor.ocr({ filePath: mockFilePath });
      expect(result).toEqual({ path: mockOutputPath });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockOutputPath,
        "Mocked OCR text",
      );
    });

    it("should throw an error if OCR processing fails", async () => {
      const mockError = new Error("OCR failed");
      jest.spyOn(console, "error").mockImplementation();
      jest
        .requireMock("tesseract.js")
        .createWorker.mockRejectedValueOnce(mockError);

      await expect(
        OCRProcessor.ocr({ filePath: mockFilePath }),
      ).rejects.toThrow("Error processing OCR: OCR failed");
    });
  });

  describe("get", () => {
    it("should return file content if file exists", async () => {
      const result = await OCRProcessor.get({ filePath: mockFilePath });
      expect(result).toEqual({
        path: mockFilePath,
        text: "Mocked file content",
      });
    });

    it("should throw an error if file does not exist", async () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      await expect(
        OCRProcessor.get({ filePath: mockFilePath }),
      ).rejects.toThrow("File does not exist");
    });
  });
});

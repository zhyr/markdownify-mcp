import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

export default class UVX {
  uvxPath: string;

  constructor(uvxPath: string) {
    this.uvxPath = uvxPath;
  }

  get path() {
    return this.uvxPath;
  }

  static async setup() {
    // const { stdout: uvxPath, stderr } = await execAsync("which uvx", {
    //   env: {
    //     ...process.env,
    //   },
    // });

    // if (stderr) {
    //   throw new Error(
    //     "uvx not found in path, you must install uvx before running this server",
    //   );
    // }

    // HACK ALERT!
    console.log(`[UVX] setup called`);
    return new UVX("/Users/zachcaceres/.local/bin/uvx");
  }

  async installDeps() {
    // This is a hack to make sure that markitdown is installed before it's called in the OCRProcessor
    try {
      await execAsync(`${this.uvxPath} markitdown example.pdf`);
    } catch {
      console.log("UVX markitdown should be ready now");
    }
  }
}

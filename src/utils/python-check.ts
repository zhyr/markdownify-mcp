import fs from "fs";
import { execSync } from "child_process";
import path from "path";

export function getMarkitdownPath() {
  if (process.env.IS_DOCKER_BUILD || process.env.NODE_ENV === "production") {
    return "/app/.venv/bin/markitdown";
  }
  return path.resolve(process.cwd(), ".venv/bin/markitdown");
}

export function checkMarkitdown() {
  const markitdownPath = getMarkitdownPath();
  if (!fs.existsSync(markitdownPath)) {
    console.error(`[依赖检测] 未找到 markitdown: ${markitdownPath}`);
    return false;
  }
  try {
    execSync(`${markitdownPath} --help`, { stdio: "ignore" });
    return true;
  } catch (e) {
    console.error(`[依赖检测] markitdown --help 执行失败: ${e}`);
    return false;
  }
}

export function tryAutoInstallVenvAndDeps() {
  try {
    console.log("[依赖修复] 正在自动创建虚拟环境并安装依赖...");
    execSync("python3 -m venv .venv", { stdio: "inherit" });
    execSync(".venv/bin/pip install --upgrade pip", { stdio: "inherit" });
    execSync(".venv/bin/pip install -r requirements.txt", { stdio: "inherit" });
    return true;
  } catch (e) {
    console.error("[依赖修复] 自动安装依赖失败，请手动检查 .venv 和 requirements.txt", e);
    return false;
  }
}

export function ensurePythonDepsReady() {
  if (!checkMarkitdown()) {
    if (!tryAutoInstallVenvAndDeps() || !checkMarkitdown()) {
      throw new Error("Python依赖未就绪，markitdown 不可用，请人工检查 .venv 和 requirements.txt");
    }
  }
  console.log("[依赖检测] markitdown 可用，Python依赖就绪。");
}

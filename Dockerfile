FROM node:18-bullseye

# 设置Docker构建环境变量
ENV IS_DOCKER_BUILD=1
ENV NODE_ENV=production

# 1. 安装系统依赖
RUN apt-get update && \
    apt-get install -y \
      wget ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils --no-install-recommends && \
      tesseract-ocr tesseract-ocr-chi-sim tesseract-ocr-chi-tra \
      tesseract-ocr-eng tesseract-ocr-jpn tesseract-ocr-kor \
      python3 python3-venv python3-pip build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. 复制 requirements.txt 并安装 Python 依赖
WORKDIR /app
COPY requirements.txt ./
RUN python3 -m venv .venv && \
    .venv/bin/pip install --upgrade pip && \
    .venv/bin/pip install --no-cache-dir -r requirements.txt

# 3. 复制 Node.js 项目文件
COPY package*.json tsconfig.json preinstall.cjs ./
COPY src/ ./src/

# 4. 安装 Node.js 依赖并构建
RUN npm config set registry https://registry.npmmirror.com \
    && npm install --legacy-peer-deps --production=false \
    && npm run build

# 5. 复制其余文件
COPY . .

# 6. 启动服务
CMD ["node", "--no-warnings", "dist/http-server.js"]
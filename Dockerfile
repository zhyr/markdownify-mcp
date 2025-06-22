FROM node:18-bullseye

# 1. 安装系统依赖（tesseract-ocr + python3 + pip）
RUN apt-get update && \
    apt-get install -y \
      python3 python3-pip python3-venv \
      tesseract-ocr tesseract-ocr-chi-sim tesseract-ocr-chi-tra \
      tesseract-ocr-eng tesseract-ocr-jpn tesseract-ocr-kor \
      build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. 安装 Python 依赖
COPY requirements.txt /app/requirements.txt
RUN python3 -m pip install --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# 3. 安装 Node.js 依赖
WORKDIR /app
COPY . .
RUN npm config set registry https://registry.npmmirror.com \
    && npm install --legacy-peer-deps

ENV NODE_ENV=production
ENV IS_DOCKER_BUILD=1

# 4. 启动服务
CMD ["node", "--no-warnings", "src/http-server.js"]
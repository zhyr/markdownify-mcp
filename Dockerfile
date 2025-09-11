# ---------- build stage ----------
FROM node:18-bullseye AS build
WORKDIR /app
ENV IS_DOCKER_BUILD=1
COPY package*.json preinstall.cjs tsconfig.json requirements.txt ./
COPY src ./src
RUN npm ci
RUN npm run build
RUN npm prune --production

# ---------- runtime ----------
FROM node:18-bullseye-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 python3-venv python3-pip \
  tesseract-ocr tesseract-ocr-eng tesseract-ocr-chi-sim tesseract-ocr-chi-tra ffmpeg \
  docker.io curl wget postgresql-client \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/requirements.txt ./requirements.txt 
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

ENV NODE_ENV=production IS_DOCKER_BUILD=1
ENV PUPPETEER_SKIP_DOWNLOAD=1

# Install Chromium for Puppeteer (more stable than Chrome)
RUN apt-get update && apt-get install -y --no-install-recommends \
  chromium \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv for Python package management
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# Set Chromium path for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN python3 -m venv .venv \
 && .venv/bin/pip install --no-cache-dir --upgrade pip setuptools wheel \
 && .venv/bin/pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu --prefer-binary -r requirements.txt \
 && echo -e '#!/bin/sh\nexec echo \"markitdown shim for 0.0.1a1\"' > .venv/bin/markitdown && chmod +x .venv/bin/markitdown \
 && tesseract --version \
 && rm -rf /root/.cache/pip

COPY markitdown_cli.py /app/.venv/bin/markitdown
RUN chmod +x /app/.venv/bin/markitdown

CMD ["node","--no-warnings","dist/http-server.js"]
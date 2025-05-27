FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm config set registry https://registry.npmmirror.com \
    && npm install --legacy-peer-deps
ENV NODE_ENV=production
CMD ["node", "--no-warnings", "src/http-server.js"]
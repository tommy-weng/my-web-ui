FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM node:22-alpine AS backend

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

# 用前端构建产物覆盖 public
COPY --from=frontend-build /app/public /app/public

EXPOSE 3000

CMD ["npm", "start"]

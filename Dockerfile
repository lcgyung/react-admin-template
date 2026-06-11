# --- build stage ---
FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable

# 의존성 레이어 캐시
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 소스 복사 후 빌드 (.env.production 기준)
COPY . .
RUN pnpm build

# --- serve stage ---
FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY shared/ ./shared/
COPY backend/ ./backend/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter backend build

FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./
# shared/types is type-only — erased at compile time, not needed at runtime
RUN node -e "const fs=require('fs'),p=JSON.parse(fs.readFileSync('package.json','utf8'));delete p.dependencies.shared;fs.writeFileSync('package.json',JSON.stringify(p))"
RUN npm install --omit=dev
COPY --from=builder /app/backend/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]

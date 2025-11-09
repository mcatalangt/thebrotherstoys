FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
COPY src ./src
RUN npm ci --only=production=false
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json* ./
COPY --from=build /app/dist ./dist
RUN npm ci --production
ENV PORT 8080
EXPOSE 8080
CMD ["node", "dist/index.js"]
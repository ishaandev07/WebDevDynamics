# Multi-stage Node.js build for React
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build 2>/dev/null || echo "No build script found"

FROM node:18-alpine AS runtime
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist 2>/dev/null || echo "No dist folder"
COPY --from=builder --chown=nextjs:nodejs /app/build ./build 2>/dev/null || echo "No build folder"
COPY --from=builder --chown=nextjs:nodejs /app/public ./public 2>/dev/null || echo "No public folder"
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/*.js ./
COPY --from=builder --chown=nextjs:nodejs /app/*.html ./

USER nextjs

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
FROM node:20-alpine as base

FROM base as builder

WORKDIR /app

COPY . .

RUN npm ci --ignore-scripts

RUN npx prisma generate

RUN npm run build

RUN npm ci --only=production --ignore-scripts && npm cache clean --force

FROM base as runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/start.sh .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma/migrations ./prisma/migrations
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000
CMD ["./start.sh"]
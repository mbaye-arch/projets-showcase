FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package.json
COPY src src

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]


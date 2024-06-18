FROM node:20-alpine

WORKDIR /app

COPY . .

RUN rm -rf node_modules && npm install

RUN npm run build

CMD ["./start.sh"]

EXPOSE 3000
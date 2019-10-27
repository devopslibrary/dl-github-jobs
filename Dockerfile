FROM node:13-alpine

RUN npm install -g pino-pretty && apk add yarn
COPY docker-entrypoint.sh docker-entrypoint.sh

CMD ["sh", "docker-entrypoint.sh"]

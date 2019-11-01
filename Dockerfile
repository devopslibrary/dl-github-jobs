FROM node:13-alpine

RUN npm install -g pino-pretty && apk add yarn
COPY docker-entrypoint.sh docker-entrypoint.sh

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.6.0/wait /wait
RUN chmod +x /wait

CMD ["sh", "docker-entrypoint.sh"]

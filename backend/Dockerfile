FROM node:alpine AS node-builder
RUN apk update && apk add git
WORKDIR /backend

COPY package*.json .
RUN npm install
COPY tsconfig.json .
COPY *.ts .
RUN npx tsc

FROM heroiclabs/nakama:3.26.0

COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY local.yml /nakama/data/
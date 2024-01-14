# Dockerfile

FROM node:18.16.0-alpine3.17
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json package-lock.json .
RUN yarn
COPY . .
EXPOSE 3001
CMD [ "yarn", "start:dev"]
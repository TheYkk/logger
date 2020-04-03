# Install npm packages
FROM node:12-alpine as builder
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install --prod

# Push js files
FROM node:12-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY ./src ./src
CMD node src/index.js

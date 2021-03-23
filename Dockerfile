FROM node:14-slim as builder

# Create app directory
WORKDIR /usr/src

COPY package*.json ./

RUN npm install npm@latest -g && npm install

COPY . .

ENV NODE_ENV=production

# Converts Sass into CSS, transpiles the app and webpacks browser scripts
RUN npm run build:docker

# Install prod dependencies inside the dist directory
RUN cp package.json dist && cd dist && npm install --only=prod

FROM builder as production

COPY . .

EXPOSE 3006

WORKDIR /usr/src/dist/app

# Run app
CMD [ "node", "server.js" ]

USER node

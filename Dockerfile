


FROM node:12-slim as builder

# Create app directory
WORKDIR /usr/src

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

# Converts Sass into CSS, transpiles the app and webpacks browser scripts
RUN npm run build:docker

# Install prod dependencies inside the dist directory
RUN cp package.json dist && cd dist && npm install --only=prod
# RUN cp -R dist/node_modules prod_node_modules

# Remove all files apart from the dist sub-directory
# RUN find ./ -mindepth 1 ! -regex '^./dist\(/.*\)?' -delete


FROM builder as production

# COPY /usr/src/prod_node_modules ./node_modules
# copy app sources
COPY . .

EXPOSE 3006

WORKDIR /usr/src/dist/app

# Run app
CMD [ "node", "server.js" ]

USER node

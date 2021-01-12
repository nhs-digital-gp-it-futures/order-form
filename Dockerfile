FROM node:14

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

# Remove all files apart from the dist sub-directory
RUN find ./ -mindepth 1 ! -regex '^./dist\(/.*\)?' -delete

EXPOSE 3006

WORKDIR /usr/src/dist/app

# Run app
CMD [ "node", "server.js" ]

USER node

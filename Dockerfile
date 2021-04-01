FROM node:14-alpine AS build

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm set progress=false
RUN npm install npm@latest -g
RUN npm install --omit=dev --ignore-scripts
RUN cp -R node_modules prod_node_modules
RUN npm install

ENV NODE_ENV=production

# Converts Sass into CSS, transpiles the app and webpacks browser scripts
RUN npm run build:docker

FROM node:14-alpine AS production

WORKDIR /usr/src

COPY --from=build /usr/src/app/dist .
COPY --from=build /usr/src/app/prod_node_modules ./node_modules

WORKDIR /usr/src/app

ENV NODE_ENV=production

EXPOSE 3006

# Run app
CMD [ "node", "server.js" ]

USER node

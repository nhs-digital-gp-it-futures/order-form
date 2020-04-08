// Core dependencies
const path = require('path');
const favicon = require('serve-favicon');
const helmet = require('helmet');

// External dependencies
const compression = require('compression');
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');

// Local dependencies
const config = require('./config');

class App {
  constructor() {
    // Initialise application
    this.app = express();
  }

  createApp() {
    // Adds favicon to every page
    this.app.use(favicon(path.join(__dirname, '/../node_modules/nhsuk-frontend/packages/assets/favicons', 'favicon.ico')));

    // Use gzip compression to decrease the size of
    // the response body and increase the speed of web app
    this.app.use(compression());

    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.use(express.json());

    this.app.use(helmet());

    // Middleware to serve static assets
    this.app.use(config.baseUrl ? config.baseUrl : '/', express.static(path.join(__dirname, '/../public/')));
    this.app.use(`${config.baseUrl}/nhsuk-frontend`, express.static(path.join(__dirname, '/../node_modules/nhsuk-frontend/packages')));

    // View engine (Nunjucks)
    this.app.set('view engine', 'njk');

    // Nunjucks configuration
    const appViews = [
      __dirname,
      path.join(__dirname, '/../node_modules/buying-catalogue-components/app/components/general/'),
      path.join(__dirname, '/../node_modules/buying-catalogue-components/app/components/view/'),
      path.join(__dirname, '/../node_modules/buying-catalogue-components/app/components/input/'),
      path.join(__dirname, '/../node_modules/buying-catalogue-components/app/'),
      path.join(__dirname, '/../node_modules/nhsuk-frontend/packages/'),
    ];

    nunjucks.configure(appViews, {
      autoescape: true,
      express: this.app,
      noCache: true,
    });

    return this.app;
  }
}

module.exports = { App };

// Core dependencies
const path = require('path');
const favicon = require('serve-favicon');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

// External dependencies
const compression = require('compression');
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const dateFilter = require('nunjucks-date-filter');

// Local dependencies
const config = require('./config');
const locals = require('./locals');

class App {
  constructor(authProvider) {
    // Initialise application
    this.app = express();
    this.authProvider = authProvider;
  }

  createApp() {
    // Adds favicon to every page
    this.app.use(favicon(path.join(__dirname, '/../node_modules/nhsuk-frontend/packages/assets/favicons', 'favicon.ico')));

    // Use gzip compression to decrease the size of
    // the response body and increase the speed of web app
    this.app.use(compression());

    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.use(express.json());

    // Middleware for csurf
    const csrfMiddleware = csurf({
      cookie: true,
    });
    this.app.use(cookieParser());
    this.app.use(csrfMiddleware);

    this.app.use(helmet());

    // Middleware to serve static assets
    this.app.use(config.baseUrl ? config.baseUrl : '/', express.static(path.join(__dirname, '/../public/')));
    this.app.use(`${config.baseUrl}/nhsuk-frontend`, express.static(path.join(__dirname, '/../node_modules/nhsuk-frontend/packages')));

    // View engine (Nunjucks)
    this.app.set('view engine', 'njk');

    // Use local variables
    this.app.use(locals(config));

    // Nunjucks configuration
    const appViews = [
      __dirname,
      path.join(__dirname, '/../node_modules/buying-catalogue-components/app/components/general/'),
      path.join(__dirname, '/../node_modules/buying-catalogue-components/app/components/view/'),
      path.join(__dirname, '/../node_modules/buying-catalogue-components/app/components/input/'),
      path.join(__dirname, '/../node_modules/buying-catalogue-components/app/'),
      path.join(__dirname, '/../node_modules/nhsuk-frontend/packages/'),
    ];

    const env = nunjucks.configure(appViews, {
      autoescape: true,
      express: this.app,
      noCache: true,
    });

    env.addFilter('dateTime', dateFilter);

    if (this.authProvider) {
      this.authProvider.setup(this.app);
    }

    return this.app;
  }
}

module.exports = { App };

/* eslint-disable import/no-extraneous-dependencies */
import express from 'express';
import request from 'supertest';
import cheerio from 'cheerio';
import nunjucks from 'nunjucks';
import { App } from '../app';
import config from '../config';

const addConfig = ({ context }) => ({
  ...context,
  config: {
    ...config,
    ...context.config,
  },
});

const testFunction = ({ setup, done }) => {
  const app = new App().createApp();
  const router = express.Router();

  const macroWrapper = setup.component ? `{% from '${setup.component.path}' import ${setup.component.name} %}
                      {{ ${setup.component.name}(params) }}` : '';

  return {
    request: (context, callback) => {
      const dummyRouter = router.get('/', (req, res) => {
        if (setup.template) {
          res.render(setup.template.path, addConfig({ context }));
        } else {
          const viewToTest = nunjucks.renderString(macroWrapper, addConfig({ context }));
          res.send(viewToTest);
        }
      });
      app.use(dummyRouter);

      request(app).get('/').then((response) => {
        callback(cheerio.load(response.text));
        done();
      });
    },
  };
};

export const createTestHarness = (setup, callback) => (done) => {
  callback(testFunction({
    setup,
    done,
  }));
};

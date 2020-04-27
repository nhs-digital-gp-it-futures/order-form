import nunjucks from 'nunjucks';
import { createTestHarness } from 'buying-catalogue-library';
import { App } from '../app';
import config from '../config';

export const componentTester = (setup, callback) => (done) => {
  const app = new App().createApp();

  callback(createTestHarness({
    app,
    templateEngine: nunjucks,
    config,
    setup,
    done,
  }));
};

import request from 'supertest';
import { App } from './app';
import { routes } from './routes';

describe('routes', () => {
  describe('GET /', () => {
    it('should return the text "works"', () => {
      const app = new App().createApp();
      app.use('/', routes());
      return request(app)
        .get('/')
        .expect(200)
        .then((res) => {
          expect(res.text).toEqual('Works');
        });
    });
  });
});

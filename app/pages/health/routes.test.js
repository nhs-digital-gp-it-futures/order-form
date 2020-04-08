import request from 'supertest';
import { status } from './status';
import * as readyControllers from './ready/getReadyStatus';
import { App } from '../../app';
import routes from './routes';

describe('GET /health', () => {
  it('GET /live', () => {
    const app = new App().createApp();
    app.use('/health', routes);

    return request(app).get('/health/live').expect(status.healthy.code)
      .then((res) => {
        expect(res.text).toBe(status.healthy.message);
      });
  });

  it('GET /ready', () => {
    readyControllers.getReadyStatus = jest.fn()
      .mockImplementation(() => Promise.resolve(status.healthy));

    const app = new App().createApp();
    app.use('/health', routes);

    return request(app).get('/health/ready').expect(status.healthy.code)
      .then((res) => {
        expect(res.text).toBe(status.healthy.message);
      });
  });
});

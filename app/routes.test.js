import request from 'supertest';
import { FakeAuthProvider } from 'buying-catalogue-library';
import { App } from './app';
import { routes } from './routes';
import { setFakeCookie } from './test-utils/helper';

jest.mock('./logger');

jest.mock('./apiProvider', () => ({
  getData: jest.fn()
    .mockImplementation(() => Promise.resolve({})),
}));

const mockLogoutMethod = jest.fn().mockImplementation(() => Promise.resolve({}));

const mockAuthorisedJwtPayload = JSON.stringify({
  id: '88421113', name: 'Cool Dude', Ordering: 'manage',
});

const mockAuthorisedCookie = `fakeToken=${mockAuthorisedJwtPayload}`;

const setUpFakeApp = () => {
  const authProvider = new FakeAuthProvider(mockLogoutMethod);
  const app = new App(authProvider).createApp();
  app.use('/', routes(authProvider));
  return app;
};

const checkAuthorisedRouteNotLoggedIn = path => (
  request(setUpFakeApp())
    .get(path)
    .expect(302)
    .then((res) => {
      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual('http://identity-server/login');
    }));

describe('routes', () => {
  describe('GET /login', () => {
    it('should return the correct status and redirect to the login page when not authenticated', () => (
      request(setUpFakeApp())
        .get('/login')
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual('http://identity-server/login');
        })));
  });

  describe('GET /logout', () => {
    it('should redirect to the url provided by authProvider', async () => (
      request(setUpFakeApp())
        .get('/logout')
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual('/signout-callback-oidc');
        })));
  });

  describe('GET /signout-callback-oidc', () => {
    afterEach(() => {
      mockLogoutMethod.mockReset();
    });

    it('should redirect to /', async () => (
      request(setUpFakeApp())
        .get('/signout-callback-oidc')
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual('/');
        })));

    it('should call req.logout', async () => (
      request(setUpFakeApp())
        .get('/signout-callback-oidc')
        .expect(302)
        .then(() => {
          expect(mockLogoutMethod.mock.calls.length).toEqual(1);
        })));

    it('should delete cookies', async () => {
      const { modifiedApp, cookies } = await setFakeCookie(setUpFakeApp(), '/signout-callback-oidc');
      expect(cookies.length).toEqual(2);

      return request(modifiedApp)
        .get('/')
        .expect(200)
        .then((res) => {
          expect(res.headers['set-cookie'].length).toEqual(1);
        });
    });
  });

  describe('GET /index', () => {
    const path = '/index';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="index-page-title"')).toEqual(true);
        expect(res.text.includes('data-test-id="error-page-title"')).toEqual(false);
      }));
  });

  describe('GET *', () => {
    it('should return error page if url cannot be matched', done => request(setUpFakeApp())
      .get('/aaaa')
      .expect(200)
      .then((res) => {
        expect(res.text.includes('<h1 class="nhsuk-heading-l nhsuk-u-margin-top-5" data-test-id="error-title">Incorrect url /aaaa</h1>')).toEqual(true);
        expect(res.text.includes('<p data-test-id="error-description">Please check it is valid and try again</p>')).toEqual(true);
        done();
      }));
  });
});

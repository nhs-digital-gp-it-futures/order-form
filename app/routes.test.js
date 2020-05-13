import request from 'supertest';
import { FakeAuthProvider } from 'buying-catalogue-library';
import { App } from './app';
import { routes } from './routes';
import { baseUrl } from './config';
import { getCsrfTokenFromGet } from './test-utils/helper';
import * as dashboardController from './pages/dashboard/controller';
import * as descriptionController from './pages/sections/description/controller';

jest.mock('./logger');

dashboardController.getDashboardContext = jest.fn()
  .mockResolvedValue({});

descriptionController.postOrPutDescription = jest.fn()
  .mockResolvedValue({});

const mockLogoutMethod = jest.fn().mockImplementation(() => Promise.resolve({}));

const mockAuthorisedJwtPayload = JSON.stringify({
  id: '88421113',
  name: 'Cool Dude',
  ordering: 'manage',
  primaryOrganisationId: 'org-id',
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

const checkForbiddenNoCsrf = path => request(setUpFakeApp())
  .post(path)
  .set('Cookie', [mockAuthorisedCookie])
  .type('form')
  .send({})
  .then((res) => {
    expect(res.status).toEqual(403);
  });

const checkRedirectToLogin = async (csrfPagePath, postPath) => {
  const { cookies, csrfToken } = await getCsrfTokenFromGet(
    setUpFakeApp(), csrfPagePath, mockAuthorisedCookie,
  );
  return request(setUpFakeApp())
    .post(postPath)
    .type('form')
    .set('Cookie', [cookies])
    .send({
      _csrf: csrfToken,
    })
    .expect(302)
    .then((res) => {
      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual('http://identity-server/login');
    });
};

const checkLoggedInNotAuthorised = async (csrfPagePath, postPath) => {
  const { cookies, csrfToken } = await getCsrfTokenFromGet(
    setUpFakeApp(), csrfPagePath, mockAuthorisedCookie,
  );

  const mockUnauthorisedJwtPayload = JSON.stringify({
    id: '88421113', name: 'Cool Dude',
  });
  const mockUnauthorisedCookie = `fakeToken=${mockUnauthorisedJwtPayload}`;

  return request(setUpFakeApp())
    .post(postPath)
    .type('form')
    .set('Cookie', [cookies, mockUnauthorisedCookie])
    .send({ _csrf: csrfToken })
    .expect(200)
    .then((res) => {
      expect(res.text.includes('data-test-id="error-title"')).toEqual(true);
      expect(res.text.includes('You are not authorised to view this page')).toEqual(true);
    });
};

describe('routes', () => {
  describe('GET /', () => {
    const path = '/';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should redirect to /organisation', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation`);
      }));
  });

  describe('GET /organisation', () => {
    const path = '/organisation';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="dashboard-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      }));
  });

  describe('GET /organisation/neworder', () => {
    const path = '/organisation/neworder';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="neworder-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      }));
  });

  describe('GET /organisation/:orderId', () => {
    const path = '/organisation/some-order-id';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text).toEqual('existing order some-order-id page');
      }));
  });

  describe('GET /organisation/:orderId/description', () => {
    const path = '/organisation/some-order-id/description';

    it('should redirect to the login page if the user is not logged in', () => (
      checkAuthorisedRouteNotLoggedIn(path)
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="description-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
      }));
  });

  describe('POST /organisation/neworder/description', () => {
    const path = '/organisation/neworder/description';

    afterEach(() => {
      descriptionController.postOrPutDescription.mockReset();
    });

    it('should return 403 forbidden if no csrf token is available', async () => {
      await checkForbiddenNoCsrf(path);
    });

    it('should redirect to the login page if the user is not logged in', async () => {
      await checkRedirectToLogin(path, path);
    });

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', async () => {
      await checkLoggedInNotAuthorised(path, path);
    });

    it('should return the correct status and text if response.success is true', async () => {
      descriptionController.postOrPutDescription = jest.fn()
        .mockImplementation(() => Promise.resolve({ success: true, orderId: 'order1' }));

      const { cookies, csrfToken } = await getCsrfTokenFromGet(
        setUpFakeApp(), path, mockAuthorisedCookie,
      );

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({
          description: 'a description of the order',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order1`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
    // TODO: validation
    // it('should return the correct status and text if response.success is false', async () => {});
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

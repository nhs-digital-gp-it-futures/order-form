import request from 'supertest';
import {
  FakeAuthProvider,
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  getCsrfTokenFromGet,
  fakeSessionManager,
} from 'buying-catalogue-library';
import { App } from '../../app';
import { routes } from '../../routes';
import { baseUrl } from '../../config';
import * as deleteOrderController from './controller';

const mockLogoutMethod = jest.fn().mockImplementation(() => Promise.resolve({}));

const mockAuthorisedJwtPayload = JSON.stringify({
  id: '88421113',
  name: 'Cool Dude',
  ordering: 'manage',
  primaryOrganisationId: 'org-id',
});

const mockAuthorisedCookie = `fakeToken=${mockAuthorisedJwtPayload}`;

const mockUnauthorisedJwtPayload = JSON.stringify({
  id: '88421113', name: 'Cool Dude',
});
const mockUnauthorisedCookie = `fakeToken=${mockUnauthorisedJwtPayload}`;

const setUpFakeApp = () => {
  const authProvider = new FakeAuthProvider(mockLogoutMethod);
  const app = new App(authProvider).createApp();
  app.use('/', routes(authProvider, fakeSessionManager()));
  return app;
};

describe('GET /organisation/:orderId/delete-order', () => {
  const path = '/organisation/some-order-id/delete-order';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect to the login page if the user is not logged in', () => (
    testAuthorisedGetPathForUnauthenticatedUser({
      app: request(setUpFakeApp()), getPath: path, expectedRedirectPath: 'http://identity-server/login',
    })
  ));

  it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
    testAuthorisedGetPathForUnauthorisedUser({
      app: request(setUpFakeApp()),
      getPath: path,
      getPathCookies: [mockUnauthorisedCookie],
      expectedPageId: 'data-test-id="error-title"',
      expectedPageMessage: 'You are not authorised to view this page',
    })
  ));

  it('should return the deleted-order page if authorised', async () => {
    deleteOrderController.getDeleteOrderContext = jest.fn()
      .mockResolvedValueOnce();

    const res = await request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200);
    expect(res.text.includes('data-test-id="delete-order-page"')).toBeTruthy();
  });
});

describe('POST /organisation/:orderId/delete-order', () => {
  const path = '/organisation/order-1/delete-order';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 403 forbidden if no csrf token is available', async () => {
    await testPostPathWithoutCsrf({
      app: request(setUpFakeApp()),
      postPath: path,
      postPathCookies: [mockAuthorisedCookie],
    });
  });

  it('should redirect to the login page if the user is not logged in', async () => {
    await testAuthorisedPostPathForUnauthenticatedUser({
      app: request(setUpFakeApp()),
      getPath: path,
      postPath: path,
      getPathCookies: [mockAuthorisedCookie],
      postPathCookies: [],
      expectedRedirectPath: 'http://identity-server/login',
    });
  });

  it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => testAuthorisedPostPathForUnauthorisedUsers({
    app: request(setUpFakeApp()),
    getPath: path,
    postPath: path,
    getPathCookies: [mockAuthorisedCookie],
    postPathCookies: [mockUnauthorisedCookie],
    expectedPageId: 'data-test-id="error-title"',
    expectedPageMessage: 'You are not authorised to view this page',
  }));

  it('should redirect to /delete-order/confirmation page, if the order is deleted', async () => {
    deleteOrderController.getDeleteOrderContext = jest.fn()
      .mockResolvedValueOnce();

    deleteOrderController.deleteOrder = jest.fn().mockResolvedValueOnce();

    const { cookies, csrfToken } = await getCsrfTokenFromGet({
      app: request(setUpFakeApp()),
      getPath: path,
      getPathCookies: [mockAuthorisedCookie],
    });

    const res = await request(setUpFakeApp())
      .post(path)
      .type('form')
      .set('Cookie', [cookies, mockAuthorisedCookie])
      .send({
        _csrf: csrfToken,
      })
      .expect(302);

    expect(res.redirect).toEqual(true);
    expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/delete-order/confirmation`);
  });
});

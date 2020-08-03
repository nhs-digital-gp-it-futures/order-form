import request from 'supertest';
import {
  FakeAuthProvider,
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
  fakeSessionManager,
} from 'buying-catalogue-library';
import { App } from '../../app';
import { routes } from '../../routes';
import { getFundingSource } from '../../helpers/api/ordapi/getFundingSource';
import { getOrderDescription } from '../../helpers/routes/getOrderDescription';

jest.mock('../../logger');
jest.mock('../../helpers/api/ordapi/getFundingSource');
jest.mock('../../helpers/routes/getOrderDescription');

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

describe('GET /organisation/:orderId/complete-order', () => {
  const path = '/organisation/some-order-id/complete-order';

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

  it('should return the correct status and text when the user is authorised', () => {
    getFundingSource.mockResolvedValue(true);
    getOrderDescription.mockResolvedValue({});
    return request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.text.includes('complete-order-page')).toBeTruthy();
      });
  });
});

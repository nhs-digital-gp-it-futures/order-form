import request from 'supertest';
import {
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  getCsrfTokenFromGet,
} from 'buying-catalogue-library';
import {
  mockUnauthorisedCookie,
  mockAuthorisedCookie,
  setUpFakeApp,
} from '../../test-utils/routesTestHelper';
import { baseUrl } from '../../config';
import { getFundingSource } from '../../helpers/api/ordapi/getFundingSource';
import { getOrderDescription } from '../../helpers/routes/getOrderDescription';
import { putOrderStatus } from '../../helpers/api/ordapi/putOrderStatus';

jest.mock('../../logger');
jest.mock('../../helpers/api/ordapi/getFundingSource');
jest.mock('../../helpers/routes/getOrderDescription');
jest.mock('../../helpers/api/ordapi/putOrderStatus');

const mockFundingCookie = `fundingSource=${true}`;

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

describe('POST /organisation/:orderId/complete-order', () => {
  const path = '/organisation/some-order-id/complete-order';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 403 forbidden if no csrf token is available', () => {
    putOrderStatus.mockResolvedValue({});

    return testPostPathWithoutCsrf({
      app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
    });
  });

  it('should redirect to the login page if the user is not logged in', () => {
    getFundingSource.mockResolvedValue(true);
    putOrderStatus.mockResolvedValue({});

    return testAuthorisedPostPathForUnauthenticatedUser({
      app: request(setUpFakeApp()),
      getPath: path,
      postPath: path,
      getPathCookies: [mockAuthorisedCookie],
      postPathCookies: [],
      expectedRedirectPath: 'http://identity-server/login',
    });
  });

  it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
    getFundingSource.mockResolvedValue(true);
    putOrderStatus.mockResolvedValue({});

    return testAuthorisedPostPathForUnauthorisedUsers({
      app: request(setUpFakeApp()),
      getPath: path,
      postPath: path,
      getPathCookies: [mockAuthorisedCookie],
      postPathCookies: [mockUnauthorisedCookie],
      expectedPageId: 'data-test-id="error-title"',
      expectedPageMessage: 'You are not authorised to view this page',
    });
  });

  it('should return the correct status and text if no error is thrown', async () => {
    getFundingSource.mockResolvedValue(true);
    putOrderStatus.mockResolvedValue({});

    const { cookies, csrfToken } = await getCsrfTokenFromGet({
      app: request(setUpFakeApp()),
      getPath: path,
      getPathCookies: [mockAuthorisedCookie],
    });

    return request(setUpFakeApp())
      .post(path)
      .type('form')
      .set('Cookie', [cookies, mockAuthorisedCookie])
      .send({ _csrf: csrfToken })
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/some-order-id/complete-order/order-confirmation`);
        expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
      });
  });
});

describe('GET /organisation/:orderId/complete-order/order-confirmation', () => {
  const path = '/organisation/some-order-id/complete-order/order-confirmation';

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
      .set('Cookie', [mockAuthorisedCookie, mockFundingCookie])
      .expect(200)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.text.includes('order-confirmation-page')).toBeTruthy();
      });
  });
});

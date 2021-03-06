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
import * as deleteOrderController from './controller';
import { getOrganisationFromOdsCode } from '../../helpers/controllers/odsCodeLookup';
import mockOrgData from '../../test-utils/mockData/mockOrganisationData.json';

jest.mock('../../helpers/controllers/odsCodeLookup');

describe('GET /organisation/:odsCode/order/:orderId/delete-order', () => {
  const path = '/organisation/odsCode/order/some-order-id/delete-order';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect to the login page if the user is not logged in', () => {
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
    return testAuthorisedGetPathForUnauthenticatedUser({
      app: request(setUpFakeApp()), getPath: path, expectedRedirectPath: 'http://identity-server/login',
    });
  });

  it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
    return testAuthorisedGetPathForUnauthorisedUser({
      app: request(setUpFakeApp()),
      getPath: path,
      getPathCookies: [mockUnauthorisedCookie],
      expectedPageId: 'data-test-id="error-title"',
      expectedPageMessage: 'You are not authorised to view this page',
    });
  });

  it('should return the deleted-order page if authorised', async () => {
    deleteOrderController.getDeleteOrderContext = jest.fn()
      .mockResolvedValueOnce();
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

    const res = await request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200);
    expect(res.text.includes('data-test-id="delete-order-page"')).toBeTruthy();
  });
});

describe('POST /organisation/:odsCode/order/:orderId/delete-order', () => {
  const path = '/organisation/odsCode/order/order-1/delete-order';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 403 forbidden if no csrf token is available', async () => {
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
    return testPostPathWithoutCsrf({
      app: request(setUpFakeApp()),
      postPath: path,
      postPathCookies: [mockAuthorisedCookie],
    });
  });

  it('should redirect to the login page if the user is not logged in', async () => {
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
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
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
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

  it('should redirect to /delete-order/confirmation page, if the order is deleted', async () => {
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
    deleteOrderController.getDeleteOrderContext = jest.fn()
      .mockResolvedValueOnce({ odsCode: '03F' });

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
    expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-1/delete-order/confirmation`);
  });
});

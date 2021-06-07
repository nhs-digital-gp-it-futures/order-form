import request from 'supertest';
import {
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
} from 'buying-catalogue-library';
import {
  mockUnauthorisedCookie,
  mockAuthorisedCookie,
  setUpFakeApp,
} from '../../test-utils/routesTestHelper';
import * as taskListController from './controller';
import { getOrganisationFromOdsCode } from '../../helpers/controllers/odsCodeLookup';
import mockOrgData from '../../test-utils/mockData/mockOrganisationData.json';

jest.mock('../../helpers/controllers/odsCodeLookup');

describe('GET /organisation/:odsCode/order/:orderId', () => {
  const path = '/organisation/odsCode/order/order-id';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect to the login page if the user is not logged in', () => {
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

    return testAuthorisedGetPathForUnauthenticatedUser({
      app: request(setUpFakeApp()), getPath: path, expectedRedirectPath: 'http://identity-server/login',
    });
  });

  it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
    testAuthorisedGetPathForUnauthorisedUser({
      app: request(setUpFakeApp()),
      getPath: path,
      getPathCookies: [mockUnauthorisedCookie],
      expectedPageId: 'data-test-id="error-title"',
      expectedPageMessage: 'You are not authorised to view this page',
    })
  ));

  it('should return the neworder page with correct status when the user is authorised', () => {
    taskListController.getTaskListPageContext = jest.fn()
      .mockResolvedValueOnce({ orderId: 'neworder' });
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

    return request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="neworder-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      });
  });

  it('should return the existing order page with correct status when the user is authorised', () => {
    taskListController.getTaskListPageContext = jest.fn()
      .mockResolvedValueOnce({ orderId: 'order-id' });
    getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

    return request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="order-id-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      });
  });
});

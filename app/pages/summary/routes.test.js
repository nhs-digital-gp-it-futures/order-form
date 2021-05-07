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
import { getOrder } from '../../helpers/api/ordapi/getOrder';
import * as summaryController from './controller';

jest.mock('../../helpers/api/ordapi/getOrder');

describe('GET /organisation/:odsCode/:orderId/summary', () => {
  const path = '/organisation/odsCode/order-id/summary';

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
    getOrder.mockResolvedValueOnce({});

    summaryController.getSummaryPageContext = jest.fn()
      .mockResolvedValueOnce({});

    return request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="summary-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      });
  });

  it('should return the printable summary page when the print flag is passed in', () => {
    const pathWithPrintFlag = `${path}?print=true`;

    getOrder.mockResolvedValueOnce({});

    summaryController.getSummaryPageContext = jest.fn()
      .mockResolvedValueOnce({});

    return request(setUpFakeApp())
      .get(pathWithPrintFlag)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="summary-page-print"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      });
  });
});

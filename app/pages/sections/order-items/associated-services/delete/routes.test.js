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
} from '../../../../../test-utils/routesTestHelper';
import { baseUrl } from '../../../../../config';
import * as deleteCatalogueSolutionController from '../../catalogue-solutions/delete/controller';
import * as confirmDeleteCatalogueSolutionController from '../../catalogue-solutions/delete/confirmation/controller';
import { getOrganisationFromOdsCode } from '../../../../../helpers/controllers/odsCodeLookup';
import mockOrgData from '../../../../../test-utils/mockData/mockOrganisationData.json';

jest.mock('../../../../../helpers/controllers/odsCodeLookup');
jest.mock('../../../../../helpers/api/ordapi/deleteCatalogueSolution');

describe('Associated services delete routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /organisation/:odsCode/order/:orderId/associated-services/delete/:catalogueItemId/confirmation/:solutionName', () => {
    const path = '/organisation/odsCode/order/some-order-id/associated-services/delete/order-item-1/confirmation/write-on-time-associated-service';

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

    it('should return the associated-services page if authorised', () => {
      deleteCatalogueSolutionController.getDeleteCatalogueSolutionContext = jest.fn()
        .mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="delete-catalogue-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/associated-services/delete/:catalogueItemId/confirmation/:solutionName', () => {
    const path = '/organisation/odsCode/order/some-order-id/associated-services/delete/order-item-1/confirmation/write-on-time-associated-service';

    it('should return 403 forbidden if no csrf token is available', async () => {
      await testPostPathWithoutCsrf({
        app: request(setUpFakeApp()),
        postPath: path,
        postPathCookies: [mockAuthorisedCookie],
      });
    });

    it('should redirect to the login page if the user is not logged in', () => {
      deleteCatalogueSolutionController.getDeleteCatalogueSolutionContext = jest.fn()
        .mockResolvedValue({});
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
      deleteCatalogueSolutionController.getDeleteCatalogueSolutionContext = jest.fn()
        .mockResolvedValue({});
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

    it('should redirect to associated services deletion confirmation page, if the associated service is deleted', async () => {
      deleteCatalogueSolutionController.getDeleteCatalogueSolutionContext = jest.fn()
        .mockResolvedValueOnce({});
      deleteCatalogueSolutionController.deleteCatalogueSolution = jest.fn().mockResolvedValueOnce();
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/some-order-id/associated-services/delete/order-item-1/confirmation/write-on-time-associated-service/continue`);
        });
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/associated-services/delete/:catalogueItemId/confirmation/:solutionName/continue', () => {
    const path = '/organisation/odsCode/order/some-order-id/associated-services/delete/order-item-1/confirmation/write-on-time-associated-service/continue';

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

    it('should return the associated-services page if authorised', () => {
      confirmDeleteCatalogueSolutionController
        .getDeleteCatalogueSolutionConfirmationContext = jest.fn().mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="delete-catalogue-confirmation-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/associated-services/delete/:catalogueItemId/confirmation/:solutionName/continue', () => {
    const path = '/organisation/odsCode/order/some-order-id/associated-services/delete/order-item-1/confirmation/write-on-time-associated-service/continue';

    it('should return 403 forbidden if no csrf token is available', async () => {
      await testPostPathWithoutCsrf({
        app: request(setUpFakeApp()),
        postPath: path,
        postPathCookies: [mockAuthorisedCookie],
      });
    });

    it('should redirect to the login page if the user is not logged in', () => {
      confirmDeleteCatalogueSolutionController
        .getDeleteCatalogueSolutionConfirmationContext = jest.fn().mockResolvedValue({});
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
      confirmDeleteCatalogueSolutionController
        .getDeleteCatalogueSolutionConfirmationContext = jest.fn().mockResolvedValue({});
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

    it('should redirect to associated services deletion confirmation page, if the associated service is deleted', async () => {
      confirmDeleteCatalogueSolutionController
        .getDeleteCatalogueSolutionConfirmationContext = jest.fn().mockResolvedValueOnce({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/some-order-id/associated-services`);
        });
    });
  });
});

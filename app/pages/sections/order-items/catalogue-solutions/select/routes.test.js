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
import * as catalogueSolutionPriceController from './price/controller';
import * as selectSolutionController from './solution/controller';
import * as selectRecipientController from './recipients/controller';
import { baseUrl } from '../../../../../config';
import { getServiceRecipients as getRecipientsFromOapi } from '../../../../../helpers/api/oapi/getServiceRecipients';
import { findSelectedCatalogueItemInSession } from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import { getCatalogueItems } from '../../../../../helpers/api/bapi/getCatalogueItems';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { getSupplier } from '../../../../../helpers/api/ordapi/getSupplier';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

jest.mock('../../../../../logger');
jest.mock('../../../../../helpers/api/oapi/getServiceRecipients');
jest.mock('../../../../../helpers/routes/findSelectedCatalogueItemInSession');
jest.mock('../../../../../helpers/api/bapi/getCatalogueItems');
jest.mock('../../../../../helpers/api/bapi/getCatalogueItemPricing');
jest.mock('../../../../../helpers/api/ordapi/getSupplier');

const mockSessionSolutionsState = JSON.stringify([
  { catalogueItemId: 'solution-1', name: 'Solution 1' },
  { catalogueItemId: 'solution-2', name: 'Solution 2' },
]);
const mockSolutionsCookie = `${sessionKeys.suppliersFound}=${mockSessionSolutionsState}`;

const mockSolutionPrices = JSON.stringify({
  id: 'sol-1',
  name: 'Solution name',
  prices: [],
});
const mocksolutionPricesCookie = `${sessionKeys.solutionPrices}=${mockSolutionPrices}`;

describe('catalogue-solutions select routes', () => {
  describe('GET /organisation/:orderId/catalogue-solutions/select', () => {
    const path = '/organisation/order-1/catalogue-solutions/select';

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

    it('should redirect to the catalogue-solutions/select/solution', () => {
      selectSolutionController.getSolutionsPageContext = jest.fn()
        .mockResolvedValue({});

      getSupplier.mockResolvedValue({ supplierId: 'supp-1' });

      getCatalogueItems.mockResolvedValue([]);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/select/solution`);
        });
    });
  });

  describe('GET /organisation/:orderId/catalogue-solutions/select/solution', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/select/solution';

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

    it('should return the catalogue-solutions select-solution page if authorised', () => {
      selectSolutionController.getSolutionsPageContext = jest.fn()
        .mockResolvedValue({});

      getSupplier.mockResolvedValue({ supplierId: 'supp-1' });

      getCatalogueItems.mockResolvedValue([]);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-select-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/catalogue-solutions/select/solution', () => {
    const path = '/organisation/order-1/catalogue-solutions/select/solution';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
        postPathCookies: [mockSolutionsCookie],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should show the solution select page with errors if there are validation errors', async () => {
      selectSolutionController.validateSolutionForm = jest.fn()
        .mockReturnValue({ success: false });

      selectSolutionController.getSolutionsErrorPageContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'Select a solution', href: '#selectSolution' }],
        });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-select-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/some-order-id/catalogue-solutions/select/solution/price if a solution is selected', async () => {
      selectSolutionController.validateSolutionForm = jest.fn()
        .mockReturnValue({ success: true });

      findSelectedCatalogueItemInSession.mockResolvedValue({ name: 'Solution One' });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsCookie])
        .send({
          selectSolution: 'solution-1',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/select/solution/price`);
        });
    });
  });

  describe('GET /organisation/:orderId/catalogue-solutions/select/solution/price', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/select/solution/price';

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

    it('should return the catalogue-solutions select price page if authorised', async () => {
      catalogueSolutionPriceController.getSolutionPricePageContext = jest.fn()
        .mockResolvedValue({});

      getCatalogueItemPricing.mockResolvedValue([]);

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);

      expect(res.text.includes('data-test-id="solution-price-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });
  });

  describe('POST /organisation/:orderId/catalogue-solutions/select/solution/price', () => {
    const path = '/organisation/order-1/catalogue-solutions/select/solution/price';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
        postPathCookies: [mocksolutionPricesCookie],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should show the solution select page with errors if there are validation errors', async () => {
      catalogueSolutionPriceController.validateSolutionPriceForm = jest.fn()
        .mockReturnValue({ success: false });

      getCatalogueItemPricing.mockResolvedValue([]);

      catalogueSolutionPriceController.getSolutionPriceErrorPageContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'Select a List price', href: '#selectSolutionPrice' }],
        });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsCookie, mocksolutionPricesCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-price-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/some-order-id/catalogue-solutions/select/solution/price if a solution is selected', async () => {
      catalogueSolutionPriceController.validateSolutionPriceForm = jest.fn()
        .mockReturnValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsCookie, mocksolutionPricesCookie])
        .send({
          selectSolutionPrice: '0001',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/select/solution/price/recipients`);
        });
    });
  });

  describe('GET /organisation/:orderId/catalogue-solutions/select/solution/price/recipients', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/select/solution/price/recipients';

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

    it('should return the catalogue-solutions select recipient page if authorised', () => {
      getRecipientsFromOapi.mockResolvedValue([]);

      selectRecipientController.getServiceRecipientsContext = jest.fn()
        .mockResolvedValue({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-recipients-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/catalogue-solutions/select/solution/price/recipients', () => {
    const path = '/organisation/order-1/catalogue-solutions/select/solution/price/recipients';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should redirect to /organisation/order-1/catalogue-solutions/neworderitem when a recipient is selected', async () => {
      // Mock here validation success

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
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/neworderitem`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });
});

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
import * as selectPlannedDateController from './date/controller';
import { baseUrl } from '../../../../../config';
import { getServiceRecipients as getRecipientsFromOapi } from '../../../../../helpers/api/oapi/getServiceRecipients';
import { findSelectedCatalogueItemInSession } from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import { getCatalogueItems } from '../../../../../helpers/api/bapi/getCatalogueItems';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { getSupplier } from '../../../../../helpers/api/ordapi/getSupplier';
import { getCommencementDate } from '../../../../../helpers/routes/getCommencementDate';
import { putPlannedDeliveryDate } from '../../../../../helpers/api/ordapi/putPlannedDeliveryDate';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

jest.mock('../../../../../logger');
jest.mock('../../../../../helpers/api/oapi/getServiceRecipients');
jest.mock('../../../../../helpers/routes/findSelectedCatalogueItemInSession');
jest.mock('../../../../../helpers/api/bapi/getCatalogueItems');
jest.mock('../../../../../helpers/api/bapi/getCatalogueItemPricing');
jest.mock('../../../../../helpers/api/ordapi/getSupplier');
jest.mock('../../../../../helpers/routes/getCommencementDate');
jest.mock('../../../../../helpers/routes/getOrderItemPageData');
jest.mock('../../../../../helpers/api/ordapi/putPlannedDeliveryDate');

const mockSessionSolutionsState = JSON.stringify([
  { catalogueItemId: 'solution-1', name: 'Solution 1' },
  { catalogueItemId: 'solution-2', name: 'Solution 2' },
]);
const mockSessionOrderItemsState = JSON.stringify([
  { catalogueItemId: 'solution-1', catalogueItemType: 'Solution', catalogueItemName: 'Solution 1' },
  { catalogueItemId: 'solution-2', catalogueItemType: 'Solution', catalogueItemName: 'Solution 2' },
  { catalogueItemId: 'solution-3', catalogueItemType: 'Solution', catalogueItemName: 'Solution 3' },
]);
const mockSolutionsCookie = `${sessionKeys.suppliersFound}=${mockSessionSolutionsState}`;
const mockOrderItemsCookie = `${sessionKeys.orderItems}=${mockSessionOrderItemsState}`;
const mockSolutionPrices = JSON.stringify({
  id: 'sol-1',
  name: 'Solution name',
  prices: [],
});
const mocksolutionPricesCookie = `${sessionKeys.solutionPrices}=${mockSolutionPrices}`;

const mockRecipientsState = JSON.stringify([{
  name: 'Some service recipient 1',
  odsCode: 'ods1',
}, {
  name: 'Some service recipient 2',
  odsCode: 'ods2',
}]);
const mockRecipientsCookie = `${sessionKeys.recipients}=${mockRecipientsState}`;

const mockItemNameCookie = `${sessionKeys.selectedItemName}=Solution One`;

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

    it('should redirect to /organisation/some-order-id/catalogue-solutions/catalogueItemId if a existing solution is selected', async () => {
      selectSolutionController.validateSolutionForm = jest.fn()
        .mockReturnValue({ success: true });

      findSelectedCatalogueItemInSession.mockReturnValue({ catalogueItemId: 'solution-1', name: 'Solution 1' });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie, mockOrderItemsCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsCookie, mockOrderItemsCookie])
        .send({
          selectedItem: { catalogueItemId: 'solution-1' },
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/solution-1`);
        });
    });

    it('should redirect to /organisation/some-order-id/catalogue-solutions/select/solution/price if a new solution is selected', async () => {
      selectSolutionController.validateSolutionForm = jest.fn()
        .mockReturnValue({ success: true });

      findSelectedCatalogueItemInSession.mockReturnValue({ catalogueItemId: 'solution-4', name: 'Solution 4' });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsCookie, mockOrderItemsCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsCookie, mockOrderItemsCookie])
        .send({
          selectedItem: { catalogueItemId: 'solution-4' },
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
    afterEach(() => {
      jest.resetAllMocks();
    });

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

    it('should return the catalogue-solutions select service recipients page if only one price returned', async () => {
      catalogueSolutionPriceController.getSolutionPricePageContext = jest.fn()
        .mockResolvedValue({});

      getCatalogueItemPricing.mockResolvedValue({ prices: [{ priceId: 1 }] });

      await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/some-order-id/catalogue-solutions/select/solution/price/recipients`);
        });
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
    const mockSetContext = jest.fn();
    beforeEach(() => {
      selectRecipientController.setContextIfBackFromCatalogueSolutionEdit = mockSetContext;

      getRecipientsFromOapi.mockResolvedValue([]);

      selectRecipientController.getServiceRecipientsContext = jest.fn()
        .mockResolvedValue({});
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

    it('should return the catalogue-solutions select recipient page if authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="solution-recipients-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        expect(mockSetContext).toHaveBeenCalled();
      }));

    it('should set context if authorised and back from catalogue solution edit', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="solution-recipients-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        expect(mockSetContext).toHaveBeenCalled();
      }));
  });

  describe('POST /organisation/:orderId/catalogue-solutions/select/solution/price/recipients', () => {
    const path = '/organisation/order-1/catalogue-solutions/select/solution/price/recipients';
    const mockSetContext = jest.fn();
    beforeEach(() => {
      selectRecipientController.setContextIfBackFromCatalogueSolutionEdit = mockSetContext;
    });

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
        getPathCookies: [mockAuthorisedCookie, mockItemNameCookie],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockItemNameCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should show the recipient select page with errors if there are validation errors', async () => {
      getRecipientsFromOapi.mockResolvedValue([]);

      selectRecipientController.validateSolutionRecipientsForm = jest.fn()
        .mockReturnValue({ success: false });

      selectRecipientController
        .getServiceRecipientsErrorPageContext = jest.fn()
          .mockResolvedValue({
            errors: [{ text: 'Select a recipient', href: '#selectSolutionRecipients' }],
          });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockItemNameCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockItemNameCookie, mockRecipientsCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(mockSetContext).toHaveBeenCalled();
          expect(res.text.includes('data-test-id="solution-recipients-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/order-1/catalogue-solutions/select/solution/price/recipients/date when a recipient is selected', async () => {
      selectRecipientController.validateSolutionRecipientsForm = jest.fn()
        .mockReturnValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockItemNameCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockItemNameCookie])
        .send({ _csrf: csrfToken })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/select/solution/price/recipients/date`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to select solution price endpoint when a recipient is selected and orderItemId is posted', async () => {
      selectRecipientController.getSelectSolutionPriceEndpoint = jest.fn()
        .mockReturnValue('/organisation/order-1/catalogues-solutions/42');

      selectRecipientController.validateSolutionRecipientsForm = jest.fn()
        .mockReturnValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockItemNameCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockItemNameCookie])
        .send({ _csrf: csrfToken, orderItemId: 42 })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogues-solutions/42`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('GET /organisation/:orderId/catalogue-solutions/select/solution/price/recipients/date', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/select/solution/price/recipients/date';

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

    it('should return the catalogue-solutions select planned delivery date if authorised', () => {
      getCommencementDate.mockResolvedValue('');

      selectPlannedDateController.getDeliveryDateContext = jest.fn()
        .mockResolvedValue({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="planned-delivery-date-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/catalogue-solutions/select/solution/price/recipients/date', () => {
    const path = '/organisation/order-1/catalogue-solutions/select/solution/price/recipients/date';

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
        getPathCookies: [mockAuthorisedCookie, mockItemNameCookie],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockItemNameCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should show the recipient select page with errors if there are validation errors', async () => {
      selectPlannedDateController.validateDeliveryDateForm = jest.fn().mockReturnValue([{}]);

      selectPlannedDateController.getDeliveryDateErrorPageContext = jest.fn().mockResolvedValue({
        errors: [{ text: 'error', field: ['year'], href: '#plannedDeliveryDate' }],
      });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockItemNameCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockItemNameCookie, mockRecipientsCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="planned-delivery-date-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should return the correct status and text if the api response is unsuccessful', async () => {
      selectPlannedDateController.validateDeliveryDateForm = jest.fn().mockReturnValue([{}]);

      putPlannedDeliveryDate.mockResolvedValue({ success: false, errors: [{}] });

      selectPlannedDateController.getDeliveryDateErrorPageContext = jest.fn().mockResolvedValue({
        errors: [{ text: 'error', field: ['year'], href: '#plannedDeliveryDate' }],
      });

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
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="planned-delivery-date-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('GET /organisation/:orderId/catalogue-solutions/select/solution/price/flat/ondemand', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/select/solution/price/flat/ondemand';
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
  });
});

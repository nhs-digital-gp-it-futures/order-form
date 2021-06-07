import request from 'supertest';
import {
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  getCsrfTokenFromGet,
  ErrorContext,
} from 'buying-catalogue-library';
import {
  mockUnauthorisedCookie,
  mockAuthorisedCookie,
  setUpFakeApp,
} from '../../../../../test-utils/routesTestHelper';
import { baseUrl } from '../../../../../config';
import * as selectAssociatedServiceController from './associated-service/controller';
import * as selectAssociatedServicePriceController from './price/controller';
import { findSelectedCatalogueItemInSession } from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';
import { getOrganisationFromOdsCode } from '../../../../../helpers/controllers/odsCodeLookup';
import mockOrgData from '../../../../../test-utils/mockData/mockOrganisationData.json';

jest.mock('../../../../../logger');
jest.mock('../../../../../helpers/routes/findSelectedCatalogueItemInSession');
jest.mock('../../../../../helpers/api/bapi/getCatalogueItemPricing');
jest.mock('../../../../../helpers/controllers/odsCodeLookup');

const associatedServiceId = '10000-A-001';
const associatedServices = [
  {
    associatedServiceId,
    name: 'Associated Service 1',
  }];

const mockSessionOrderItemsState = JSON.stringify([
  { catalogueItemId: '10000-A-001', catalogueItemType: 'AssociatedService', catalogueItemName: 'Associated Service 1' },
  { catalogueItemId: '10000-A-002', catalogueItemType: 'AssociatedService', catalogueItemName: 'Associated Service 2' },
]);
const mockOrderItemsCookie = `${sessionKeys.orderItems}=${mockSessionOrderItemsState}`;

describe('associated-services select routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /organisation/:odsCode/order/:orderId/associated-services/select', () => {
    const path = '/organisation/odsCode/order/order-1/associated-services/select';

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

    it('should redirect to the associated-services/select/associated-service', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-1/associated-services/select/associated-service`);
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/associated-services/select/associated-service', () => {
    const path = '/organisation/odsCode/order/some-order-id/associated-services/select/associated-service';

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

    it('should throw error context when no associated services', async () => {
      selectAssociatedServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([]);
      selectAssociatedServiceController.findAssociatedServices = jest.fn()
        .mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      try {
        await request(setUpFakeApp())
          .get(path)
          .set('Cookie', [mockAuthorisedCookie]);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorContext);
      }
    });

    it('should return the associated-services select-associated-service page if authorised', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      selectAssociatedServiceController.getAssociatedServicePageContext = jest.fn()
        .mockResolvedValue({});
      selectAssociatedServiceController.findAssociatedServices = jest.fn()
        .mockResolvedValue({});

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);

      expect(res.text.includes('data-test-id="associated-service-select-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/associated-services/select/associated-service', () => {
    const path = '/organisation/odsCode/order/order-1/associated-services/select/associated-service';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()),
        postPath: path,
        postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', async () => {
      selectAssociatedServiceController.findAssociatedServices = jest.fn()
        .mockResolvedValue([{ id: '1' }]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      selectAssociatedServiceController.getAssociatedServicePageContext = jest.fn()
        .mockResolvedValue({});

      await testAuthorisedPostPathForUnauthenticatedUser({
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

      selectAssociatedServiceController.findAssociatedServices = jest.fn()
        .mockResolvedValue([{ id: '1' }]);

      selectAssociatedServiceController.getAssociatedServicePageContext = jest.fn()
        .mockResolvedValue({});

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

    it('should show the associated services select page with errors if there are validation errors', async () => {
      selectAssociatedServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([
          {
            catalogueItemId: 'Some catalogue item id',
          },
        ]);

      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      selectAssociatedServiceController.findAssociatedServices = jest.fn()
        .mockResolvedValue({});

      selectAssociatedServiceController.getAssociatedServicePageContext = jest.fn()
        .mockResolvedValue({});

      selectAssociatedServiceController.validateAssociatedServicesForm = jest.fn()
        .mockReturnValue({ success: false });

      selectAssociatedServiceController.getAssociatedServiceErrorPageContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'Select an associated service', href: '#selectAssociatedService' }],
        });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(200);

      expect(res.text.includes('data-test-id="associated-service-select-page"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
    });

    it('should redirect to /organisation/some-order-id/associated-services/catalogueItemId if an existing associated service is selected', async () => {
      selectAssociatedServiceController.findAssociatedServices = jest.fn()
        .mockResolvedValue(associatedServices);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      findSelectedCatalogueItemInSession.mockReturnValue({ catalogueItemId: '10000-A-001', name: 'Associated Service 1', solution: { solutionId: 'solution-1' } });
      selectAssociatedServiceController.getAssociatedServicePageContext = jest.fn()
        .mockResolvedValue({});

      selectAssociatedServiceController.validateAssociatedServicesForm = jest.fn()
        .mockReturnValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockOrderItemsCookie],
      });

      const mockSelectedItemCookie = `${sessionKeys.selectedItemId}=${associatedServiceId}`;
      const mockAssociatedServicesCookie = `${sessionKeys.associatedServices}=${JSON.stringify(associatedServices)}`;

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockAssociatedServicesCookie, mockSelectedItemCookie, mockOrderItemsCookie])
        .send({
          selectAssociatedService: associatedServiceId,
          _csrf: csrfToken,
        })
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-1/associated-services/${associatedServiceId}`);
    });

    it('should redirect to /organisation/some-order-id/associated-services/select/associated-service/price if an associated service is selected', async () => {
      selectAssociatedServiceController.findAssociatedServices = jest.fn()
        .mockResolvedValue(associatedServices);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      findSelectedCatalogueItemInSession.mockReturnValue({ catalogueItemId: '10000-A-003', name: 'Associated Service 3', solution: { solutionId: 'solution-1' } });
      selectAssociatedServiceController.getAssociatedServicePageContext = jest.fn()
        .mockResolvedValue({});

      selectAssociatedServiceController.validateAssociatedServicesForm = jest.fn()
        .mockReturnValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockOrderItemsCookie],
      });

      const mockSelectedItemCookie = `${sessionKeys.selectedItemId}=${associatedServiceId}`;
      const mockAssociatedServicesCookie = `${sessionKeys.associatedServices}=${JSON.stringify(associatedServices)}`;

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockAssociatedServicesCookie, mockSelectedItemCookie, mockOrderItemsCookie])
        .send({
          selectAssociatedService: associatedServiceId,
          _csrf: csrfToken,
        })
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-1/associated-services/select/associated-service/price`);
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/associated-services/select/associated-service/price', () => {
    const path = '/organisation/odsCode/order/some-order-id/associated-services/select/associated-service/price';

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

    it('should return the associated-services select-associated-service page if authorised', async () => {
      selectAssociatedServicePriceController.getAssociatedServicePricePageContext = jest.fn()
        .mockResolvedValue({});

      getCatalogueItemPricing.mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);

      expect(res.text.includes('data-test-id="associated-service-price-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/associated-services/select/associated-service/price', () => {
    const path = '/organisation/odsCode/order/order-1/associated-services/select/associated-service/price';
    const prices = [
      {
        priceId: 1,
        type: 'flat',
        currencyCode: 'GBP',
        itemUnit: {
          name: 'patient',
          description: 'per patient',
        },
        timeUnit: {
          name: 'year',
          description: 'per year',
        },
        price: 1.64,
      }];

    const pricesCookie = `${sessionKeys.associatedServicePrices}=${JSON.stringify(prices)}`;

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [pricesCookie],
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

    it('should show the associated service select price page with errors if there are validation errors', async () => {
      selectAssociatedServicePriceController.validateAssociatedServicePriceForm = jest.fn()
        .mockReturnValue({ success: false });

      getCatalogueItemPricing.mockResolvedValue(prices);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      selectAssociatedServicePriceController.getAssociatedServicePricePageContext = jest.fn()
        .mockResolvedValue({});

      selectAssociatedServicePriceController
        .getAssociatedServicePriceErrorPageContext = jest.fn()
          .mockResolvedValue({
            errors: [{ text: 'Select a List price', href: '#selectAssociatedServicePrice' }],
          });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [],
      });

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, pricesCookie])
        .send({ _csrf: csrfToken })
        .expect(200);

      expect(res.text.includes('data-test-id="associated-service-price-page"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
    });

    it('should redirect to /organisation/some-order-id/associated-services/select/associated-service/price/recipient if a price is selected', async () => {
      selectAssociatedServicePriceController.validateAssociatedServicePriceForm = jest.fn()
        .mockReturnValue({ success: true });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, pricesCookie])
        .send({
          selectAssociatedServicePrice: '1',
          _csrf: csrfToken,
        })
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-1/associated-services/neworderitem`);
    });
  });
});

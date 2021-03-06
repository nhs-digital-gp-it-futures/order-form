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
import * as selectAdditionalServiceController from './additional-service/controller';
import * as additionalServicePriceController from './price/controller';
import * as selectAdditionalServiceRecipientController from './recipient/controller';
import * as catalogueSolutionsFlatOrderItemController from '../../catalogue-solutions/order-item/flat/controller';
import config from '../../../../../config';
import { getRecipients } from '../../../../../helpers/api/ordapi/getRecipients';
import * as routerHelper from '../../../../../helpers/routes/routerHelper';
import { findSelectedCatalogueItemInSession } from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { getAdditionalServices } from '../../../../../helpers/api/bapi/getAdditionalServices';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';
import * as getRecipientsFromOapi from '../../../../../helpers/api/oapi/getServiceRecipients';
import * as getAdditionalServicesContextItems from '../../../../../helpers/routes/getAdditionalServicesContextItems';
import * as validateFormFunction from '../../../../../helpers/controllers/validateSolutionRecipientsForm';
import * as selectRecipientController from '../../catalogue-solutions/select/recipients/controller';
import * as selectPlannedDateController from '../../catalogue-solutions/select/date/controller';
import { getCommencementDate } from '../../../../../helpers/routes/getCommencementDate';
import { putPlannedDeliveryDate } from '../../../../../helpers/api/ordapi/putPlannedDeliveryDate';
import { getOrganisationFromOdsCode } from '../../../../../helpers/controllers/odsCodeLookup';
import mockOrgData from '../../../../../test-utils/mockData/mockOrganisationData.json';

jest.mock('../../../../../logger');
jest.mock('../../../../../helpers/api/ordapi/getRecipients');
jest.mock('../../../../../helpers/routes/findSelectedCatalogueItemInSession');
jest.mock('../../../../../helpers/api/bapi/getCatalogueItemPricing');
jest.mock('../../../../../helpers/api/bapi/getAdditionalServices');
jest.mock('../../../../../helpers/routes/getCommencementDate');
jest.mock('../../../../../helpers/api/ordapi/putPlannedDeliveryDate');
jest.mock('../../../../../helpers/controllers/odsCodeLookup');

const mockRecipientSessionState = JSON.stringify([
  { id: 'recipient-1', name: 'Recipient 1' },
  { id: 'recipient-2', name: 'Recipient 2' },
]);
const mockSessionOrderItemsState = JSON.stringify([
  { catalogueItemId: '100001-001-A01', catalogueItemType: 'AdditionalService', catalogueItemName: 'Additionalservice 1' },
  { catalogueItemId: '100001-001-A02', catalogueItemType: 'AdditionalService', catalogueItemName: 'Additionalservice 2' },
]);
const additionalServiceId = '100001-001-A01';
const additionalServices = [
  {
    additionalServiceId,
    name: 'Additionalservice 1',
  }];
const selectedCatalogueItemIdInSession = { catalogueItemId: '100001-001-A01', name: 'Additionalservice 4', solution: { solutionId: 'solution-1' } };
const mockOrderItemsCookie = `${sessionKeys.orderItems}=${mockSessionOrderItemsState}`;
const mockSelectedItemCookie = `${sessionKeys.selectedItemId}=${additionalServiceId}`;
const mockAdditionalServicesCookie = `${sessionKeys.additionalServices}=${JSON.stringify(additionalServices)}`;
const mockRecipientsCookie = `${sessionKeys.recipients}=${mockRecipientSessionState}`;
const mockSelectedItemNameState = 'Item name';
const mockSelectedItemNameCookie = `${sessionKeys.selectedItemName}=${mockSelectedItemNameState}`;
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

const pricesCookie = `${sessionKeys.additionalServicePrices}=${JSON.stringify(prices)}`;

describe('additional-services select routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /organisation/:odsCode/order/:orderId/additional-services/select/additional-service/price/recipients', () => {
    const path = '/organisation/odsCode/order/order-1/additional-services/select/additional-service/price/recipients';

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
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
        postPathCookies: [mockRecipientsCookie, mockSelectedItemNameCookie],
        expectedRedirectPath: 'http://identity-server/login',
      });
    });

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      getRecipients.mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
        postPathCookies: [
          mockUnauthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      });
    });

    it('should show the recipient select page with errors if there are validation errors', async () => {
      getRecipients.mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      validateFormFunction.validateSolutionRecipientsForm = jest.fn()
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
          mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-recipients-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to additional services page when a recipient is selected and orderItemId is posted', async () => {
      const slug = '/organisation/odsCode/order/order-1/additional-services/8372';
      const expectedLocation = `${config.baseUrl}${slug}?submitted=${8372}`;
      selectRecipientController.getSelectSolutionPriceEndpoint = jest.fn()
        .mockReturnValue(slug);
      validateFormFunction.validateSolutionRecipientsForm = jest.fn()
        .mockReturnValue({ success: true });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie])
        .send({ _csrf: csrfToken, orderItemId: 8372 })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(expectedLocation);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to delivery date page when a recipient is selected', async () => {
      validateFormFunction.validateSolutionRecipientsForm = jest.fn()
        .mockReturnValue({ success: true });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie])
        .send({ _csrf: csrfToken })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${config.baseUrl}/organisation/odsCode/order/order-1/additional-services/select/additional-service/price/recipients/date`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/additional-services/select/additional-service/price/recipients/date', () => {
    const path = '/organisation/odsCode/order/order-1/additional-services/select/additional-service/price/recipients/date';

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
        getPathCookies: [mockAuthorisedCookie, mockSelectedItemNameCookie],
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
        getPathCookies: [mockAuthorisedCookie, mockSelectedItemNameCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      });
    });

    it('should show the recipient select page with errors if there are validation errors', async () => {
      selectPlannedDateController.validateDeliveryDateForm = jest.fn().mockReturnValue([{}]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      selectPlannedDateController.getDeliveryDateErrorPageContext = jest.fn().mockResolvedValue({
        errors: [{ text: 'error', field: ['year'], href: '#plannedDeliveryDate' }],
      });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockSelectedItemNameCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSelectedItemNameCookie, mockRecipientsCookie])
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
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

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

  describe('GET /organisation/:odsCode/order/:orderId/additional-services/select', () => {
    const path = '/organisation/odsCode/order/order-1/additional-services/select';

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

    it('should redirect to the additional-services/select/additional-service', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${config.baseUrl}/organisation/odsCode/order/order-1/additional-services/select/additional-service`);
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/additional-services/select/additional-service', () => {
    const path = '/organisation/odsCode/order/some-order-id/additional-services/select/additional-service';

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

    it('should return the additional-services select-additional-service page if authorised', async () => {
      selectAdditionalServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([
          {
            catalogueItemId: 'Some catalogue item id',
          },
        ]);

      getAdditionalServices.mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      selectAdditionalServiceController.getAdditionalServicePageContext = jest.fn()
        .mockResolvedValue({});

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);

      expect(res.text.includes('data-test-id="additional-service-select-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });

    it('should throw error context when no additional services', async () => {
      selectAdditionalServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([]);

      getAdditionalServices.mockResolvedValue([]);

      try {
        await request(setUpFakeApp())
          .get(path)
          .set('Cookie', [mockAuthorisedCookie]);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorContext);
      }
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/additional-services/select/additional-service', () => {
    const path = '/organisation/odsCode/order/order-1/additional-services/select/additional-service';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()),
        postPath: path,
        postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', async () => {
      selectAdditionalServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([]);

      getAdditionalServices.mockResolvedValue([{ id: '1' }]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      selectAdditionalServiceController.getAdditionalServicePageContext = jest.fn()
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
      selectAdditionalServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      getAdditionalServices.mockResolvedValue([{ id: '1' }]);

      selectAdditionalServiceController.getAdditionalServicePageContext = jest.fn()
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

    it('should show the additional services select page with errors if there are validation errors', async () => {
      selectAdditionalServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([
          {
            catalogueItemId: 'Some catalogue item id',
          },
        ]);

      getAdditionalServices.mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      selectAdditionalServiceController.getAdditionalServicePageContext = jest.fn()
        .mockResolvedValue({});

      selectAdditionalServiceController.validateAdditionalServicesForm = jest.fn()
        .mockReturnValue({ success: false });

      selectAdditionalServiceController.getAdditionalServiceErrorPageContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'Select an additional service', href: '#selectAdditionalService' }],
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

      expect(res.text.includes('data-test-id="additional-service-select-page"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
    });

    it('should redirect to /organisation/odsCode/order/some-order-id/additional-services/catalogueItemId if a existing additional service is selected', async () => {
      selectAdditionalServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([]);
      getAdditionalServices.mockResolvedValue(additionalServices);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      selectAdditionalServiceController.validateAdditionalServicesForm = jest.fn()
        .mockReturnValue({ success: true });
      findSelectedCatalogueItemInSession.mockReturnValue(selectedCatalogueItemIdInSession);
      selectAdditionalServiceController.getAdditionalServicePageContext = jest.fn()
        .mockResolvedValue({});

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });
      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockAdditionalServicesCookie, mockSelectedItemCookie, mockOrderItemsCookie])
        .send({
          _csrf: csrfToken,
        })
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${config.baseUrl}/organisation/odsCode/order/order-1/additional-services/${additionalServiceId}`);
    });

    it('should redirect to /organisation/odsCode/order/some-order-id/additional-services/select/additional-service/price if an additional service is selected', async () => {
      selectAdditionalServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([]);

      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      getAdditionalServices.mockResolvedValue(additionalServices);

      selectAdditionalServiceController.validateAdditionalServicesForm = jest.fn()
        .mockReturnValue({ success: true });
      findSelectedCatalogueItemInSession.mockReturnValue({ catalogueItemId: '100001-001-A03', name: 'Additionalservice 3', solution: { solutionId: 'solution-1' } });
      selectAdditionalServiceController.getAdditionalServicePageContext = jest.fn()
        .mockResolvedValue({});

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockAdditionalServicesCookie, mockSelectedItemCookie, mockOrderItemsCookie])
        .send({
          _csrf: csrfToken,
        })
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${config.baseUrl}/organisation/odsCode/order/order-1/additional-services/select/additional-service/price`);
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/additional-services/select/additional-service/price', () => {
    const path = '/organisation/odsCode/order/some-order-id/additional-services/select/additional-service/price';

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

    it('should call getCatalogueItemPricing once with the correct params if authorised', async () => {
      getCatalogueItemPricing.mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const accessToken = 'access_token';

      routerHelper.extractAccessToken = jest.fn().mockReturnValue(accessToken);

      const selectedAdditionalServiceId = 12;

      await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie, `${sessionKeys.selectedItemId}=${selectedAdditionalServiceId}`]);

      expect(getCatalogueItemPricing.mock.calls.length)
        .toEqual(1);

      expect(getCatalogueItemPricing).toHaveBeenCalledWith({
        catalogueItemId: selectedAdditionalServiceId,
        accessToken,
        loggerText: 'Additional service',
      });
    });

    it('should redirect to /organisation/odsCode/order/some-order-id/additional-services/select/additional-service/price/recipients when pricing has one value', async () => {
      getCatalogueItemPricing.mockResolvedValue({
        prices: [
          { priceId: 42 },
        ],
      });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      routerHelper.extractAccessToken = jest.fn().mockReturnValue('access_token');

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie, `${sessionKeys.selectedItemId}=12`]);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${config.baseUrl}/organisation/odsCode/order/some-order-id/additional-services/select/additional-service/price/recipients`);
    });

    it('should return the additional-services select price page if authorised and pricing has multiple values', async () => {
      additionalServicePriceController.getAdditionalServicePricePageContext = jest.fn()
        .mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      getCatalogueItemPricing.mockResolvedValue({
        prices: [
          { priceId: 42 },
          { priceId: 29 },
        ],
      });

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);

      expect(res.text.includes('data-test-id="additional-service-price-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/additional-services/select/additional-service/price', () => {
    const path = '/organisation/odsCode/order/order-1/additional-services/select/additional-service/price';

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

    it('should show the additional service select price page with errors if there are validation errors', async () => {
      additionalServicePriceController.validateAdditionalServicePriceForm = jest.fn()
        .mockReturnValue({ success: false });

      getCatalogueItemPricing.mockResolvedValue(prices);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      additionalServicePriceController.getAdditionalServicePricePageContext = jest.fn()
        .mockResolvedValue({});

      additionalServicePriceController.getAdditionalServicePriceErrorPageContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'Select a List price', href: '#selectAdditionalServicePrice' }],
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

      expect(res.text.includes('data-test-id="additional-service-price-page"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
    });

    it('should redirect to /organisation/odsCode/order/some-order-id/additional-services/select/additional-service/price/recipients if a price is selected', async () => {
      additionalServicePriceController.validateAdditionalServicePriceForm = jest.fn()
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
          selectAdditionalServicePrice: '1',
          _csrf: csrfToken,
        })
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${config.baseUrl}/organisation/odsCode/order/order-1/additional-services/select/additional-service/price/recipients`);
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/additional-services/select/additional-service/price/recipient', () => {
    const path = '/organisation/odsCode/order/some-order-id/additional-services/select/additional-service/price/recipient';

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

    it('should get context with correct params if authorised', async () => {
      const additionalServicePrices = 42;
      const recipients = jest.fn();
      const selectedAdditionalRecipientId = 121;
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      getRecipients.mockResolvedValue(recipients);
      selectAdditionalServiceRecipientController
        .getAdditionalServiceRecipientPageContext = jest.fn();
      await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie, `${sessionKeys.additionalServicePrices}=42`,
          `${sessionKeys.selectedItemName}=item-name`,
          `${sessionKeys.selectedRecipientId}=${selectedAdditionalRecipientId}`,
        ])
        .expect(200);

      expect(selectAdditionalServiceRecipientController.getAdditionalServiceRecipientPageContext)
        .toHaveBeenCalledWith({
          orderId: 'some-order-id',
          itemName: 'item-name',
          recipients,
          selectedAdditionalRecipientId,
          additionalServicePrices,
          odsCode: 'odsCode',
        });
    });

    it('should return the additional-services select recipient page if authorised', async () => {
      getRecipients.mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);

      expect(res.text.includes('data-test-id="additional-service-recipient-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/additional-services/select/additional-service/price/recipients', () => {
    const path = '/organisation/odsCode/order/some-order-id/additional-services/select/additional-service/price/recipients';
    beforeEach(() => {
      getAdditionalServicesContextItems.getAdditionalServicesContextItems = jest.fn()
        .mockResolvedValue({
          serviceRecipients: [], selectedRecipients: [], additionalServicePrices: [], itemName: 'SystemOne Admin',
        });

      getRecipientsFromOapi.getServiceRecipients = jest.fn()
        .mockReturnValue([]);

      selectAdditionalServiceRecipientController.getServiceRecipientsContext = jest.fn()
        .mockResolvedValue({});

      selectAdditionalServiceRecipientController.getBackLinkHref = jest.fn()
        .mockReturnValue('http://returnurl.com');

      selectAdditionalServiceRecipientController
        .setContextIfBackFromAdditionalServiceEdit = jest.fn();
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

    it('should clear recipients from session if authorised', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);
    });

    it('should return the additional-services select recipients page if authorised', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie]);

      expect(selectAdditionalServiceRecipientController.getBackLinkHref).toHaveBeenCalled();
      expect(selectAdditionalServiceRecipientController.setContextIfBackFromAdditionalServiceEdit)
        .toHaveBeenCalled();
      expect(res.text.includes('data-test-id="solution-recipients-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="solution-recipients-page-title"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/additional-services/select/additional-service/price/recipient', () => {
    const path = '/organisation/odsCode/order/order-1/additional-services/select/additional-service/price/recipient';

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
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
        postPathCookies: [mockRecipientsCookie, mockSelectedItemNameCookie],
        expectedRedirectPath: 'http://identity-server/login',
      });
    });

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      getRecipients.mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
        postPathCookies: [
          mockUnauthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      });
    });

    it('should show the recipient select page with errors if there are validation errors', async () => {
      getRecipients.mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      selectAdditionalServiceRecipientController.validateAdditionalServiceRecipientForm = jest.fn()
        .mockReturnValue({ success: false });

      selectAdditionalServiceRecipientController
        .getAdditionalServiceRecipientErrorPageContext = jest.fn()
          .mockResolvedValue({
            errors: [{ text: 'Select a recipient', href: '#selectRecipient' }],
          });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="additional-service-recipient-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/odsCode/order/order-1/additional-services/select/additional-service/neworderitem if a recipient is selected', async () => {
      getRecipients.mockResolvedValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      selectAdditionalServiceRecipientController.validateAdditionalServiceRecipientForm = jest.fn()
        .mockReturnValue({ success: true });

      selectAdditionalServiceRecipientController.getAdditionalServiceRecipientName = jest.fn()
        .mockReturnValue('service recipient one');

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie])
        .send({
          selectRecipient: 'recipient-1',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location)
            .toEqual(`${config.baseUrl}/organisation/odsCode/order/order-1/additional-services/neworderitem`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/additional-services/select/additional-service/price/recipients/date', () => {
    const path = '/organisation/odsCode/order/order-1/additional-services/select/additional-service/price/recipients/date';

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

    it('should set context backLinkHref if authorised', () => {
      getCommencementDate.mockResolvedValue('');
      const mockContext = {};
      selectPlannedDateController.getDeliveryDateContext = jest.fn()
        .mockResolvedValue(mockContext);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then(() => {
          expect(mockContext.backLinkHref)
            .toEqual(`${config.baseUrl}/organisation/odsCode/order/order-1/additional-services/select/additional-service/price/recipients`);
        });
    });

    it('should return the additional-services select planned delivery date if authorised', () => {
      getCommencementDate.mockResolvedValue('');
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
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

  describe('GET /organisation/:odsCode/order/:orderId/additional-services/select/additional-service/price/flat/ondemand', () => {
    const path = '/organisation/odsCode/order/some-order-id/additional-services/select/additional-service/price/flat/ondemand';
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

    it('should set backLinkHref on context if authorised', () => {
      const context = {};
      catalogueSolutionsFlatOrderItemController.getProvisionTypeOrderContext = jest.fn()
        .mockResolvedValue(context);
      getAdditionalServicesContextItems
        .getAdditionalServicesPriceContextItemsFromSession = jest.fn()
          .mockReturnValue({});

      selectPlannedDateController.getDeliveryDateContext = jest.fn()
        .mockResolvedValue({});

      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then(() => {
          expect(context.backLinkHref)
            .toEqual(`${config.baseUrl}/organisation/odsCode/order/some-order-id/additional-services/select/additional-service/price/recipients/date`);
        });
    });

    it('should return the additional-services provision type page if authorised', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      catalogueSolutionsFlatOrderItemController.getProvisionTypeOrderContext = jest.fn()
        .mockResolvedValue({});
      getAdditionalServicesContextItems
        .getAdditionalServicesPriceContextItemsFromSession = jest.fn()
          .mockReturnValue({
            formData: {
              quantity: 10,
              selectEstimationPeriod: {},
            },
            itemName: 'some-name',
            selectedPrice: {},
          });

      selectPlannedDateController.getDeliveryDateContext = jest.fn()
        .mockResolvedValue({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="order-item-provisiontype-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });
});

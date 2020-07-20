import request from 'supertest';
import {
  FakeAuthProvider,
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  getCsrfTokenFromGet,
  fakeSessionManager,
} from 'buying-catalogue-library';
import { App } from '../../../../../app';
import { routes } from '../../../../../routes';
import { baseUrl } from '../../../../../config';
import * as selectAssociatedServiceController from './associated-service/controller';
import * as selectAssociatedServicePriceController from './price/controller';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';

jest.mock('../../../../../logger');
jest.mock('../../../../../helpers/api/bapi/getCatalogueItemPricing');

const mockLogoutMethod = jest.fn().mockResolvedValue({});

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

describe('associated-services select routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /organisation/:orderId/associated-services/select', () => {
    const path = '/organisation/order-1/associated-services/select';

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

    it('should redirect to the associated-services/select/associated-service', async () => {
      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/associated-services/select/associated-service`);
    });
  });

  describe('GET /organisation/:orderId/associated-services/select/associated-service', () => {
    const path = '/organisation/some-order-id/associated-services/select/associated-service';

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

    it('should return the associated-services select-associated-service page if authorised', async () => {
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

  describe('GET /organisation/:orderId/associated-services/select/associated-service/price', () => {
    const path = '/organisation/some-order-id/associated-services/select/associated-service/price';

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

    it('should return the associated-services select-associated-service page if authorised', async () => {
      selectAssociatedServicePriceController.getAssociatedServicePricePageContext = jest.fn()
        .mockResolvedValue({});

      getCatalogueItemPricing.mockResolvedValue([]);

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);

      expect(res.text.includes('data-test-id="associated-service-price-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });
  });

  describe('POST /organisation/:orderId/associated-services/select/associated-service/price', () => {
    const path = '/organisation/order-1/associated-services/select/associated-service/price';
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

    const pricesCookie = `associatedServicePrices=${JSON.stringify(prices)}`;

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
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [pricesCookie],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should show the associated service select price page with errors if there are validation errors', async () => {
      selectAssociatedServicePriceController.validateAssociatedServicePriceForm = jest.fn()
        .mockReturnValue({ success: false });

      getCatalogueItemPricing.mockResolvedValue(prices);

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
      expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/associated-services/neworderitem`);
    });
  });
});

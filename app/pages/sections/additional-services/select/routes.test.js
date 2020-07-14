import request from 'supertest';
import {
  FakeAuthProvider,
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  fakeSessionManager,
  getCsrfTokenFromGet,
  ErrorContext,
} from 'buying-catalogue-library';
import * as selectAdditionalServiceController from './additional-service/controller';
import * as additionalServicePriceController from './price/controller';
import * as selectAdditionalServiceRecipientController from './recipient/controller';
import { App } from '../../../../app';
import { routes } from '../../../../routes';
import { baseUrl } from '../../../../config';
import { getRecipients } from '../../../../helpers/api/ordapi/getRecipients';
import * as routerHelper from '../../../../helpers/routes/routerHelper';

jest.mock('../../../../logger');
jest.mock('../../../../helpers/api/ordapi/getRecipients');

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

const mockRecipientSessionState = JSON.stringify([
  { id: 'recipient-1', name: 'Recipient 1' },
  { id: 'recipient-2', name: 'Recipient 2' },
]);
const mockRecipientsCookie = `recipients=${mockRecipientSessionState}`;

const mockSelectedItemNameState = 'Item name';
const mockSelectedItemNameCookie = `selectedItemName=${mockSelectedItemNameState}`;

const setUpFakeApp = () => {
  const authProvider = new FakeAuthProvider(mockLogoutMethod);
  const app = new App(authProvider).createApp();
  app.use('/', routes(authProvider, fakeSessionManager()));
  return app;
};

describe('additional-services select routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /organisation/:orderId/additional-services/select', () => {
    const path = '/organisation/order-1/additional-services/select';

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

    it('should redirect to the additional-services/select/additional-service', async () => {
      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/additional-services/select/additional-service`);
    });
  });

  describe('GET /organisation/:orderId/additional-services/select/additional-service', () => {
    const path = '/organisation/some-order-id/additional-services/select/additional-service';

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

    it('should return the additional-services select-additional-service page if authorised', async () => {
      selectAdditionalServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([
          {
            catalogueItemId: 'Some catalogue item id',
          },
        ]);

      selectAdditionalServiceController.findAdditionalServices = jest.fn()
        .mockResolvedValue({});

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

      selectAdditionalServiceController.findAdditionalServices = jest.fn()
        .mockResolvedValue([]);

      try {
        await request(setUpFakeApp())
          .get(path)
          .set('Cookie', [mockAuthorisedCookie]);
      } catch (err) {
        expect(err).toBeInstanceOf(ErrorContext);
      }
    });
  });

  describe('POST /organisation/:orderId/additional-services/select/additional-service', () => {
    const path = '/organisation/order-1/additional-services/select/additional-service';

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

      selectAdditionalServiceController.findAdditionalServices = jest.fn()
        .mockResolvedValue([{ id: '1' }]);

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

      selectAdditionalServiceController.findAdditionalServices = jest.fn()
        .mockResolvedValue([{ id: '1' }]);

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

      selectAdditionalServiceController.findAdditionalServices = jest.fn()
        .mockResolvedValue({});

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

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="additional-service-select-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/some-order-id/additional-services/select/additional-service/price if an additional service is selected', async () => {
      selectAdditionalServiceController.findAddedCatalogueSolutions = jest.fn()
        .mockResolvedValue([]);

      selectAdditionalServiceController.findAdditionalServices = jest.fn()
        .mockResolvedValue([{ id: '1' }]);

      selectAdditionalServiceController.getAdditionalServicePageContext = jest.fn()
        .mockResolvedValue({});

      selectAdditionalServiceController.validateAdditionalServicesForm = jest.fn()
        .mockReturnValue({ success: true });

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
          selectSolution: 'solution-1',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/additional-services/select/additional-service/price`);
        });
    });
  });

  describe('GET /organisation/:orderId/additional-services/select/additional-service/price', () => {
    const path = '/organisation/some-order-id/additional-services/select/additional-service/price';

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

    it('should call findAdditionalServicePrices once with the correct params if authorised', async () => {
      additionalServicePriceController.findAdditionalServicePrices = jest.fn()
        .mockResolvedValue([]);

      const accessToken = 'access_token';

      routerHelper.extractAccessToken = jest.fn().mockReturnValue(accessToken);

      const selectedAdditionalServiceId = 12;

      await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie, `selectedAdditionalServiceId=${selectedAdditionalServiceId}`]);

      expect(additionalServicePriceController.findAdditionalServicePrices.mock.calls.length)
        .toEqual(1);

      expect(additionalServicePriceController.findAdditionalServicePrices).toHaveBeenCalledWith({
        catalogueItemId: selectedAdditionalServiceId,
        accessToken,
      });
    });

    it('should return the additional-services select price page if authorised', async () => {
      additionalServicePriceController.getAdditionalServicePricePageContext = jest.fn()
        .mockResolvedValue({});

      additionalServicePriceController.findAdditionalServicePrices = jest.fn()
        .mockResolvedValue([]);

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);

      expect(res.text.includes('data-test-id="additional-service-price-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });
  });

  describe('GET /organisation/:orderId/additional-services/select/additional-service/price/recipient', () => {
    const path = '/organisation/some-order-id/additional-services/select/additional-service/price/recipient';

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

    it('should return the additional-services select recipient page if authorised', async () => {
      getRecipients.mockResolvedValue([]);

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);

      expect(res.text.includes('data-test-id="additional-service-recipient-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    });
  });

  describe('POST /organisation/:orderId/additional-services/select/additional-service/price/recipient', () => {
    const path = '/organisation/order-1/additional-services/select/additional-service/price/recipient';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => testAuthorisedPostPathForUnauthenticatedUser({
      app: request(setUpFakeApp()),
      getPath: path,
      postPath: path,
      getPathCookies: [
        mockAuthorisedCookie, mockRecipientsCookie, mockSelectedItemNameCookie,
      ],
      postPathCookies: [mockRecipientsCookie, mockSelectedItemNameCookie],
      expectedRedirectPath: 'http://identity-server/login',
    }));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      getRecipients.mockResolvedValue([]);

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

    it('should redirect to /organisation/some-order-id/catalogue-solutions/neworderitem if a recipient is selected', async () => {
      getRecipients.mockResolvedValue([]);

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
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/additional-services/neworderitem`);
        });
    });
  });
});

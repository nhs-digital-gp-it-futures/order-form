import request from 'supertest';
import {
  FakeAuthProvider,
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
  fakeSessionManager,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  getCsrfTokenFromGet,
} from 'buying-catalogue-library';
import * as catalogueSolutionsController from './catalogue-solutions/controller';
import * as orderItemController from './order-item/controller';
import { App } from '../../../app';
import { routes } from '../../../routes';
import { baseUrl } from '../../../config';

jest.mock('../../../logger');

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

const mockSelectedSolutionIdCookie = 'selectedSolutionId=solution-1';
const mockSelectedRecipientIdCookie = 'selectedRecipientId=recipient-1';
const mockSelectedPriceIdCookie = 'selectedPriceId=1';

const setUpFakeApp = () => {
  const authProvider = new FakeAuthProvider(mockLogoutMethod);
  const app = new App(authProvider).createApp();
  app.use('/', routes(authProvider, fakeSessionManager()));
  return app;
};

describe('catalogue-solutions section routes', () => {
  describe('GET /organisation/:orderId/catalogue-solutions', () => {
    const path = '/organisation/some-order-id/catalogue-solutions';

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

    it('should return the catalogue-solutions page if authorised', () => {
      catalogueSolutionsController.getCatalogueSolutionsPageContext = jest.fn()
        .mockResolvedValue({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="catalogue-solutions-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/catalogue-solutions', () => {
    const path = '/organisation/order-id/catalogue-solutions';
    afterEach(() => {
      catalogueSolutionsController.getCatalogueSolutionsPageContext.mockRestore();
    });

    it('should return 403 forbidden if no csrf token is available', () => {
      catalogueSolutionsController.putCatalogueSolutions = jest.fn()
        .mockResolvedValue({});

      return testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      });
    });

    it('should redirect to the login page if the user is not logged in', () => {
      catalogueSolutionsController.putCatalogueSolutions = jest.fn()
        .mockResolvedValue({});

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
      catalogueSolutionsController.putCatalogueSolutions = jest.fn()
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

    it('should return the correct status and text if response.success is true', async () => {
      catalogueSolutionsController.putCatalogueSolutions = jest.fn()
        .mockResolvedValue({ success: true });

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
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-id`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('GET /organisation/:orderId/catalogue-solutions/:orderItemId', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/newsolution';

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

    it('should return the catalogue-solutions order item page if authorised', () => {
      orderItemController.getSolution = jest.fn().mockResolvedValue({});
      orderItemController.getRecipientName = jest.fn().mockResolvedValue('Recipient One');
      orderItemController.getSelectedPrice = jest.fn().mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="order-item-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });

    it.only('should return the catalogue-solutions order item page if authorised and is not a new solution', () => {
      orderItemController.getSolution = jest.fn().mockResolvedValue({});
      orderItemController.getOrderItem = jest.fn().mockResolvedValue({});
      orderItemController.getRecipientName = jest.fn().mockResolvedValue('Recipient One');
      orderItemController.getSelectedPrice = jest.fn().mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});

      return request(setUpFakeApp())
        .get('/organisation/some-order-id/catalogue-solutions/some-order-item-id')
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="order-item-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/catalogue-solutions/:orderItemId', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/some-order-item-id';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => {
      orderItemController.getSolution = jest.fn().mockResolvedValue({});
      orderItemController.getRecipientName = jest.fn().mockResolvedValue('Recipient One');
      orderItemController.getSelectedPrice = jest.fn().mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});

      return testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
          mockSelectedSolutionIdCookie,
          mockSelectedRecipientIdCookie,
          mockSelectedPriceIdCookie,
        ],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      });
    });

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      orderItemController.getSolution = jest.fn().mockResolvedValue({});
      orderItemController.getRecipientName = jest.fn().mockResolvedValue('Recipient One');
      orderItemController.getSelectedPrice = jest.fn().mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});

      return testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
          mockSelectedSolutionIdCookie,
          mockSelectedRecipientIdCookie,
          mockSelectedPriceIdCookie,
        ],
        postPathCookies: [
          mockUnauthorisedCookie,
        ],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      });
    });

    it('should show the recipient select page with errors if there are validation errors', async () => {
      orderItemController.getSolution = jest.fn().mockResolvedValue({});
      orderItemController.getRecipientName = jest.fn().mockResolvedValue('Recipient One');
      orderItemController.getSelectedPrice = jest.fn().mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});
      orderItemController.getRecipients = jest.fn()
        .mockResolvedValue([]);

      orderItemController.validateOrderItemForm = jest.fn()
        .mockReturnValue({ success: false });

      orderItemController.getOrderItemErrorPageContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'Select a price', href: '#priceRequired' }],
        });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="order-item-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/some-order-id/catalogue-solutions if there are no validation errors and post is successful', async () => {
      orderItemController.getSolution = jest.fn().mockResolvedValue({});
      orderItemController.postSolutionOrderItem = jest.fn().mockResolvedValue({});
      orderItemController.getRecipientName = jest.fn().mockResolvedValue('Recipient One');
      orderItemController.getSelectedPrice = jest.fn().mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});
      orderItemController.getRecipients = jest.fn()
        .mockResolvedValue([]);

      orderItemController.validateOrderItemForm = jest.fn()
        .mockReturnValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
        ],
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
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/some-order-id/catalogue-solutions`);
        });
    });
  });
});

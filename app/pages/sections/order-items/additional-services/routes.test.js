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
} from '../../../../test-utils/routesTestHelper';
import * as additionalServicesController from './dashboard/controller';
import * as catalogueSolutionsController from '../catalogue-solutions/order-item/controller';
import * as orderItemController from './order-item/controller';
import { validateOrderItemForm } from '../../../../helpers/controllers/validateOrderItemForm';
import {
  getOrderItemRecipientsPageData,
} from '../../../../helpers/routes/getOrderItemPageData';
import { saveOrderItem } from '../../../../helpers/controllers/saveOrderItem';
import { baseUrl } from '../../../../config';
import { putOrderSection } from '../../../../helpers/api/ordapi/putOrderSection';
import { sessionKeys } from '../../../../helpers/routes/sessionHelper';

jest.mock('../../../../logger');
jest.mock('../../../../helpers/routes/getOrderItemPageData');
jest.mock('../../../../helpers/controllers/validateOrderItemForm');
jest.mock('../../../../helpers/controllers/saveOrderItem');
jest.mock('../../../../helpers/api/ordapi/putOrderSection');

const mockSelectedItemIdCookie = `${sessionKeys.selectedItemId}=item-1`;
const mockSelectedRecipientIdCookie = `${sessionKeys.selectedRecipientId}=recipient-1`;
const mockSelectedPriceIdCookie = `${sessionKeys.selectedPriceId}=1`;
const mockGetPageDataCookie = `${sessionKeys.orderItemPageData}={}`;

describe('additional-services section routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /organisation/:orderId/additional-services', () => {
    const path = '/organisation/some-order-id/additional-services';

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

    it('should return the additional-services page if authorised', () => {
      additionalServicesController.getAdditionalServicesPageContext = jest.fn()
        .mockResolvedValue({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="additional-services-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/additional-services', () => {
    const path = '/organisation/order-id/additional-services';

    it('should return 403 forbidden if no csrf token is available', () => {
      putOrderSection.mockResolvedValue({});

      return testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      });
    });

    it('should redirect to the login page if the user is not logged in', () => {
      putOrderSection.mockResolvedValue({});

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
      putOrderSection.mockResolvedValue({});

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

    it('should return the correct status and text if no error is thrown', async () => {
      putOrderSection.mockResolvedValue({});

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

  describe('GET /organisation/:orderId/additional-services/:catalogueItemId', () => {
    const path = '/organisation/some-order-id/additional-services/neworderitem';

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

    it('should return the additional-services order item page if authorised', () => {
      getOrderItemRecipientsPageData.mockResolvedValue({});
      catalogueSolutionsController.getOrderItemContext = jest.fn().mockResolvedValue({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="order-item-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/additional-services/:catalogueItemId', () => {
    const path = '/organisation/some-order-id/additional-services/neworderitem';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => {
      getOrderItemRecipientsPageData.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});

      return testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
          mockSelectedItemIdCookie,
          mockSelectedRecipientIdCookie,
          mockSelectedPriceIdCookie,
        ],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      });
    });

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      getOrderItemRecipientsPageData.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});

      return testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
          mockSelectedItemIdCookie,
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

    it('should show the additional-services order item page with errors if there are FE caught validation errors', async () => {
      getOrderItemRecipientsPageData.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});
      validateOrderItemForm.mockReturnValue([{}]);
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
        .set('Cookie', [cookies, mockAuthorisedCookie, mockGetPageDataCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="order-item-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should show the additional-services order item page with errors if the api response is unsuccessful', async () => {
      getOrderItemRecipientsPageData.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});
      validateOrderItemForm.mockReturnValue([]);
      saveOrderItem.mockResolvedValue({ success: false, errors: {} });
      orderItemController.getOrderItemErrorPageContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'Select a price', href: '#priceRequired' }],
        });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockGetPageDataCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="order-item-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/some-order-id/additional-services if there are no validation errors and post is successful', async () => {
      getOrderItemRecipientsPageData.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});
      validateOrderItemForm.mockReturnValue([]);
      saveOrderItem.mockResolvedValue({ success: true });

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
        .set('Cookie', [cookies, mockAuthorisedCookie, mockGetPageDataCookie])
        .send({
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/some-order-id/additional-services`);
        });
    });
  });
});

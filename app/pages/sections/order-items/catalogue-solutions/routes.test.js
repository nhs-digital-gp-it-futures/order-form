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
import * as catalogueSolutionsController from './dashboard/controller';
import * as orderItemController from './order-item/controller';
import { getOrderItemPageDataBulk } from '../../../../helpers/routes/getOrderItemPageDataBulk';
import { baseUrl } from '../../../../config';
import { putOrderSection } from '../../../../helpers/api/ordapi/putOrderSection';
import { sessionKeys } from '../../../../helpers/routes/sessionHelper';
import { validateOrderItemFormBulk } from '../../../../helpers/controllers/validateOrderItemFormBulk';
import { saveOrderItemBulk } from '../../../../helpers/controllers/saveOrderItemBulk';
import { transformApiValidationResponse } from '../../../../helpers/common/transformApiValidationResponse';

jest.mock('../../../../logger');
jest.mock('../../../../helpers/routes/getOrderItemPageDataBulk');
jest.mock('../../../../helpers/controllers/validateOrderItemFormBulk');
jest.mock('../../../../helpers/controllers/saveOrderItemBulk');
jest.mock('../../../../helpers/api/ordapi/putOrderSection');
jest.mock('../../../../helpers/api/ordapi/putOrderSection');
jest.mock('../../../../helpers/common/transformApiValidationResponse');

const mockSelectedRecipientIdCookie = `${sessionKeys.selectedRecipientId}=recipient-1`;
const mockSelectedPriceIdCookie = `${sessionKeys.selectedPriceId}=1`;
const mockGetPageDataCookie = `${sessionKeys.orderItemPageData}=${{ selectedRecipients: [{}] }}`;

describe('catalogue-solutions section routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

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
      putOrderSection.mockResolvedValue({});

      return testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      });
    });

    it('should redirect to the login page if the user is not logged in', () => {
      catalogueSolutionsController.getCatalogueSolutionsPageContext = jest.fn()
        .mockResolvedValue({});
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
      catalogueSolutionsController.getCatalogueSolutionsPageContext = jest.fn()
        .mockResolvedValue({});
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
      catalogueSolutionsController.getCatalogueSolutionsPageContext = jest.fn()
        .mockResolvedValue({});
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

  describe('GET /organisation/:orderId/catalogue-solutions/:orderItemId', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/neworderitem';

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
      getOrderItemPageDataBulk.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({
        questions: { price: { data: '12' } },
      });

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

  describe('POST /organisation/:orderId/catalogue-solutions/:orderItemId', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/neworderitem';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => {
      getOrderItemPageDataBulk.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({ questions: { price: { data: '' } } });

      return testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
          mockSelectedRecipientIdCookie,
          mockSelectedPriceIdCookie,
        ],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      });
    });

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      getOrderItemPageDataBulk.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({ questions: { price: { data: '' } } });

      return testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
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

    it('should show the catalogue-solutions order item page with errors if there are FE caught validation errors', async () => {
      getOrderItemPageDataBulk.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({ questions: { price: { data: '0' } } });
      orderItemController.formatFormData = jest.fn().mockResolvedValue({});
      orderItemController.setEstimationPeriod = jest.fn();
      validateOrderItemFormBulk.mockReturnValue([{}]);
      orderItemController.getOrderItemErrorContext = jest.fn()
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
          expect(orderItemController.setEstimationPeriod).toHaveBeenCalled();
          expect(res.text.includes('data-test-id="order-item-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should show the catalogue-solutions order item page with errors if the api response is unsuccessful', async () => {
      getOrderItemPageDataBulk.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({ questions: { price: { data: '0' } } });
      orderItemController.formatFormData = jest.fn().mockResolvedValue({});
      validateOrderItemFormBulk.mockReturnValue([]);
      saveOrderItemBulk.mockResolvedValue({ success: false, errors: {} });
      transformApiValidationResponse.mockReturnValue([]);

      orderItemController.getOrderItemErrorContext = jest.fn()
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

    it('should redirect to /organisation/some-order-id/catalogue-solutions if there are no validation errors and post is successful', async () => {
      getOrderItemPageDataBulk.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({ questions: { price: { data: '0' } } });
      orderItemController.formatFormData = jest.fn().mockResolvedValue({});
      orderItemController.getPageData = jest.fn().mockResolvedValue({});
      validateOrderItemFormBulk.mockReturnValue([]);
      saveOrderItemBulk.mockResolvedValue({ success: true });

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
          expect(orderItemController.getPageData).toHaveBeenCalled();
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/some-order-id/catalogue-solutions`);
        });
    });
  });
});

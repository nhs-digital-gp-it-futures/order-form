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
import * as associatedServicesController from './dashboard/controller';
import * as orderItemController from './order-item/controller';
import { validateOrderItemForm } from '../../../../helpers/controllers/validateOrderItemForm';
import { getOrderItemPageData } from '../../../../helpers/routes/getOrderItemPageData';
import { saveOrderItem } from '../../../../helpers/controllers/saveOrderItem';
import { baseUrl } from '../../../../config';
import { putOrderSection } from '../../../../helpers/api/ordapi/putOrderSection';
import { getOrganisationFromOdsCode } from '../../../../helpers/controllers/odsCodeLookup';
import { sessionKeys } from '../../../../helpers/routes/sessionHelper';
import mockOrgData from '../../../../test-utils/mockData/mockOrganisationData.json';

jest.mock('../../../../logger');
jest.mock('../../../../helpers/routes/getOrderItemPageData');
jest.mock('../../../../helpers/controllers/validateOrderItemForm');
jest.mock('../../../../helpers/controllers/saveOrderItem');
jest.mock('../../../../helpers/api/ordapi/putOrderSection');
jest.mock('../../../../helpers/controllers/odsCodeLookup');

const mockSelectedItemIdCookie = `${sessionKeys.selectedItemId}=item-1`;
const mockSelectedPriceIdCookie = `${sessionKeys.selectedPriceId}=1`;
const mockGetPageDataCookie = `${sessionKeys.orderItemPageData}={}`;

describe('associated-services section routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /organisation/:odsCode/order/:orderId/associated-services', () => {
    const path = '/organisation/odsCode/order/some-order-id/associated-services';

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
      associatedServicesController.getAssociatedServicesPageContext = jest.fn()
        .mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="associated-services-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/associated-services', () => {
    const path = '/organisation/odsCode/order/order-id/associated-services';

    it('should return 403 forbidden if no csrf token is available', () => {
      putOrderSection.mockResolvedValue({});

      return testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      });
    });

    it('should redirect to the login page if the user is not logged in', () => {
      associatedServicesController.getAssociatedServicesPageContext = jest.fn()
        .mockResolvedValue({});
      putOrderSection.mockResolvedValue({});
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
      associatedServicesController.getAssociatedServicesPageContext = jest.fn()
        .mockResolvedValue({});
      putOrderSection.mockResolvedValue({});
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

    it('should return the correct status and text if no error is thrown', async () => {
      associatedServicesController.getAssociatedServicesPageContext = jest.fn()
        .mockResolvedValue({});
      putOrderSection.mockResolvedValue({});
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
        .send({ _csrf: csrfToken })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-id`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/associated-services/:orderItemId', () => {
    const path = '/organisation/odsCode/order/some-order-id/associated-services/neworderitem';

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

    it('should return the associated-services order item page if authorised', () => {
      getOrderItemPageData.mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
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
  });

  describe('POST /organisation/:odsCode/order/:orderId/associated-services/:orderItemId', () => {
    const path = '/organisation/odsCode/order/some-order-id/associated-services/neworderitem';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => {
      getOrderItemPageData.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
          mockSelectedItemIdCookie,
          mockSelectedPriceIdCookie,
        ],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      });
    });

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      getOrderItemPageData.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie,
          mockSelectedItemIdCookie,
          mockSelectedPriceIdCookie,
        ],
        postPathCookies: [
          mockUnauthorisedCookie,
        ],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      });
    });

    it('should show the associated-services order item page with errors if there are FE caught validation errors', async () => {
      getOrderItemPageData.mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
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

    it('should show the associated-services order item page with errors if the api response is unsuccessful', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      getOrderItemPageData.mockResolvedValue({});
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

    it('should redirect to /organisation/odsCode/order/some-order-id/associated-services if there are no validation errors and post is successful', async () => {
      getOrderItemPageData.mockResolvedValue({});
      orderItemController.getOrderItemContext = jest.fn().mockResolvedValue({});
      validateOrderItemForm.mockReturnValue([]);
      saveOrderItem.mockResolvedValue({ success: true });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

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
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/some-order-id/associated-services`);
        });
    });
  });
});

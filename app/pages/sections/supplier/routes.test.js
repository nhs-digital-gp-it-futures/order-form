import request from 'supertest';
import {
  testAuthorisedGetPathForUnauthenticatedUser,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  testAuthorisedGetPathForUnauthorisedUser,
  getCsrfTokenFromGet,
} from 'buying-catalogue-library';
import {
  mockUnauthorisedCookie,
  mockAuthorisedCookie,
  setUpFakeApp,
} from '../../../test-utils/routesTestHelper';
import { baseUrl } from '../../../config';
import { sessionKeys } from '../../../helpers/routes/sessionHelper';
import { getSearchSuppliers } from '../../../helpers/api/bapi/getSearchSuppliers';
import * as supplierSearchController from './search/controller';
import * as supplierSelectController from './select/controller';
import * as supplierController from './supplier/controller';
import * as baseController from './controller';
import { putSupplier } from '../../../helpers/api/ordapi/putSupplier';
import { getOrganisationFromOdsCode } from '../../../helpers/controllers/odsCodeLookup';
import mockOrgData from '../../../test-utils/mockData/mockOrganisationData.json';

jest.mock('../../../logger');
jest.mock('../../../helpers/api/bapi/getSearchSuppliers');
jest.mock('../../../helpers/api/ordapi/putSupplier');
jest.mock('../../../helpers/controllers/odsCodeLookup');

const mockSuppliersFoundState = JSON.stringify([
  { supplierId: 'supplier-1', name: 'Supplier 1' },
  { supplierId: 'supplier-2', name: 'Supplier 2' },
]);
const mockSuppliersFoundCookie = `${sessionKeys.suppliersFound}=${mockSuppliersFoundState}`;
const mockSelectedSupplierState = 'supplier-1';
const mockSelectedSupplierCookie = `${sessionKeys.selectedSupplier}=${mockSelectedSupplierState}`;

describe('supplier section routes', () => {
  describe('GET /organisation/:odsCode/order/:orderId/supplier', () => {
    const path = '/organisation/odsCode/order/some-order-id/supplier';

    beforeEach(() => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockResolvedValue(false);
    });

    afterEach(() => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockReset();
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

    it('should return the supplier section page if authorised and no supplierSelected returned from session', () => {
      supplierController.getSupplierPageContext = jest.fn()
        .mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="supplier-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });

    it('should return the supplier section page if authorised and supplierSelected returned from session', () => {
      supplierController.getSupplierPageContext = jest.fn()
        .mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie, mockSelectedSupplierCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="supplier-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });

    it('should redirect to /organisation/odsCode/order/some-order-id/supplier/search if error from getSupplierPageContext', () => {
      supplierController.getSupplierPageContext = jest.fn()
        .mockRejectedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/some-order-id/supplier/search`);
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/supplier', () => {
    const path = '/organisation/odsCode/order/order-id/supplier';
    afterEach(() => {
      supplierController.getSupplierPageContext.mockRestore();
    });

    it('should return 403 forbidden if no csrf token is available', () => {
      supplierController.getSupplierPageContext = jest.fn()
        .mockResolvedValue({});
      return testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      });
    });

    it('should redirect to the login page if the user is not logged in', () => {
      supplierController.getSupplierPageContext = jest.fn()
        .mockResolvedValue({});
      return testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSelectedSupplierCookie],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      });
    });

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      supplierController.getSupplierPageContext = jest.fn()
        .mockResolvedValue({});
      return testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSelectedSupplierCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      });
    });

    it('should return the correct status and text if response.success is true', async () => {
      putSupplier.mockResolvedValue({ success: true });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSelectedSupplierCookie],
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

    it('should return the correct status and text if response.success is not true', async () => {
      putSupplier.mockResolvedValue({ success: false });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      supplierController.getSupplierPageErrorContext = jest.fn()
        .mockImplementation(() => Promise.resolve({
          errors: [{ text: 'First name too long', href: '#firstName' }],
        }));

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSelectedSupplierCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSelectedSupplierCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="supplier-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/supplier/search', () => {
    const path = '/organisation/odsCode/order/some-order-id/supplier/search';

    beforeEach(() => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockResolvedValue(false);
    });

    afterEach(() => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockReset();
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

    it('should redirect to /supplier if authorised and data found in ORDAPI', () => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockResolvedValue(true);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/some-order-id/supplier`);
        });
    });

    it('should return the correct status and text when the user is authorised', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="supplier-search-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/supplier/search', () => {
    const path = '/organisation/odsCode/order/order-1/supplier/search';

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
        postPathCookies: [],
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

    it('should show the supplier search page with errors if there are validation errors', async () => {
      supplierSearchController.validateSupplierSearchForm = jest.fn()
        .mockImplementation(() => ({ success: false }));

      supplierSearchController.getSupplierSearchPageErrorContext = jest.fn()
        .mockImplementation(() => Promise.resolve({
          errors: [{ text: 'Supplier name is required', href: '#supplierName' }],
        }));

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
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="supplier-search-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/odsCode/order/some-order-id/supplier/search/select if there are suppliers', async () => {
      supplierSearchController.validateSupplierSearchForm = jest.fn()
        .mockImplementation(() => ({ success: true }));
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      getSearchSuppliers.mockResolvedValue([{ supplierId: 'some-supplier-id', name: 'some-supplier-name' }]);

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
          supplierName: 'some-supp',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-1/supplier/search/select`);
        });
    });

    it('should show the error page indicating no suppliers found', async () => {
      getSearchSuppliers.mockResolvedValue([]);
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
        .send({
          supplierName: 'some-supp',
          _csrf: csrfToken,
        })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="error-title"')).toEqual(true);
          expect(res.text.includes(
            "There are no suppliers that match the search terms you've provided. Try searching again.",
          )).toEqual(true);
        });
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/supplier/search/select', () => {
    const path = '/organisation/odsCode/order/some-order-id/supplier/search/select';

    beforeEach(() => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockResolvedValue(false);
    });

    afterEach(() => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockReset();
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

    it('should show the supplier select if supplierFound are returned from session', async () => {
      supplierSelectController.getSupplierSelectPageContext = jest.fn()
        .mockImplementation(() => {});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie, mockSuppliersFoundCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(false);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
          expect(res.text.includes('data-test-id="supplier-select-page"')).toBeTruthy();
        });
    });

    it('should redirect back to /search if no supplierFound are returned from session', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/some-order-id/supplier/search`);
        });
    });

    it('should redirect to /supplier if authorised and data found in ORDAPI', () => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockResolvedValue(true);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/some-order-id/supplier`);
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/supplier/search/select', () => {
    const path = '/organisation/odsCode/order/order-1/supplier/search/select';

    beforeEach(() => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockResolvedValue(false);
    });

    afterEach(() => {
      baseController.checkOrdapiForSupplier = jest.fn()
        .mockReset();
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
        getPathCookies: [mockAuthorisedCookie, mockSuppliersFoundCookie],
        postPathCookies: [mockSuppliersFoundCookie],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSuppliersFoundCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should show the supplier select page with errors if there are validation errors', async () => {
      supplierSelectController.validateSupplierSelectForm = jest.fn()
        .mockImplementation(() => ({ success: false }));

      supplierSelectController.getSupplierSelectErrorPageContext = jest.fn()
        .mockImplementation(() => Promise.resolve({
          errors: [{ text: 'Select a supplier', href: '#selectSupplier' }],
        }));

      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSuppliersFoundCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSuppliersFoundCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="supplier-select-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/odsCode/order/some-order-id/supplier if a supplier is selected', async () => {
      supplierSelectController.validateSupplierSelectForm = jest.fn()
        .mockImplementation(() => ({ success: true }));
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSuppliersFoundCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSuppliersFoundCookie])
        .send({
          selectSupplier: 'supp-1',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-1/supplier`);
        });
    });

    it('should redirect to /organisation/some-order-id/supplier/search if no suppliersFound returned from session', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSuppliersFoundCookie],
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
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-1/supplier/search`);
        });
    });
  });
});

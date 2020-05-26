import request from 'supertest';
import {
  FakeAuthProvider,
  testAuthorisedGetPathForUnauthenticatedUser,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  testAuthorisedGetPathForUnauthorisedUser,
  getCsrfTokenFromGet,
  fakeSessionManager,
} from 'buying-catalogue-library';
import { App } from '../../../app';
import { routes } from '../../../routes';
import { baseUrl } from '../../../config';
import * as supplierSearchController from './search/controller';
import * as supplierSelectController from './select/controller';

jest.mock('../../../logger');

const mockLogoutMethod = jest.fn().mockImplementation(() => Promise.resolve({}));

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

const mockSuppliersFoundState = JSON.stringify([
  { supplierId: 'supplier-1', name: 'Supplier 1' },
  { supplierId: 'supplier-2', name: 'Supplier 2' },
]);

const mockSuppliersFoundCookie = `suppliersFound=${mockSuppliersFoundState}`;

const setUpFakeApp = () => {
  const authProvider = new FakeAuthProvider(mockLogoutMethod);
  const app = new App(authProvider).createApp();
  app.use('/', routes(authProvider, fakeSessionManager()));
  return app;
};

describe('routes', () => {
  describe('GET /organisation/:orderId/supplier', () => {
    const path = '/organisation/some-order-id/supplier';

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), pathToTest: path, expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedGetPathForUnauthorisedUser({
        app: request(setUpFakeApp()),
        pathToTest: path,
        mockUnauthorisedCookie,
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should redirect to /organisation/some-order-id/supplier/search', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/some-order-id/supplier/search`);
      }));
  });

  describe('GET /organisation/:orderId/supplier/search', () => {
    const path = '/organisation/some-order-id/supplier/search';

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), pathToTest: path, expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedGetPathForUnauthorisedUser({
        app: request(setUpFakeApp()),
        pathToTest: path,
        mockUnauthorisedCookie,
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="supplier-search-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      }));
  });

  describe('POST /organisation/:orderId/supplier/search', () => {
    const path = '/organisation/order-1/supplier/search';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), pathToTest: path, mockAuthorisedCookie,
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        csrfPagePath: path,
        pathToTest: path,
        mockAuthorisedCookie,
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        csrfPagePath: path,
        pathToTest: path,
        mockAuthorisedCookie,
        mockUnauthorisedCookie,
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

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()), csrfPagePath: path, mockAuthorisedCookie,
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

    it('should redirect to /organisation/some-order-id/supplier/search/select if there are suppliers', async () => {
      supplierSearchController.validateSupplierSearchForm = jest.fn()
        .mockImplementation(() => ({ success: true }));

      supplierSearchController.findSuppliers = jest.fn()
        .mockImplementation(() => Promise.resolve([
          { supplierId: 'some-supplier-id', name: 'some-supplier-name' }]));

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()), csrfPagePath: path, mockAuthorisedCookie,
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
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/supplier/search/select`);
        });
    });

    it('should show the error page indicating no suppliers found', async () => {
      supplierSearchController.findSuppliers = jest.fn()
        .mockImplementation(() => Promise.resolve([]));

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()), csrfPagePath: path, mockAuthorisedCookie,
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

  describe('GET /organisation/:orderId/supplier/search/select', () => {
    const path = '/organisation/some-order-id/supplier/search/select';

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), pathToTest: path, expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedGetPathForUnauthorisedUser({
        app: request(setUpFakeApp()),
        pathToTest: path,
        mockUnauthorisedCookie,
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should show the supplier select if supplierFound are returned from session', async () => {
      supplierSelectController.getSupplierSelectPageContext = jest.fn()
        .mockImplementation(() => {});

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

    it('should redirect back to /search if no supplierFound are returned from session', async () => (
      request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/some-order-id/supplier/search`);
        })));
  });
});

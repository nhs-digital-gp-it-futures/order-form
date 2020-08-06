import request from 'supertest';
import {
  FakeAuthProvider,
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
  fakeSessionManager,
} from 'buying-catalogue-library';
import { App } from './app';
import { routes } from './routes';
import { baseUrl } from './config';
import { getOrder } from './helpers/api/ordapi/getOrder';
import { getOrderDescription } from './helpers/routes/getOrderDescription';
import * as dashboardController from './pages/dashboard/controller';
import * as taskListController from './pages/task-list/controller';
import * as documentController from './documentController';
import * as previewController from './pages/preview/controller';

jest.mock('./logger');
jest.mock('./helpers/api/ordapi/getOrder');
jest.mock('./helpers/routes/getOrderDescription');

dashboardController.getDashboardContext = jest.fn()
  .mockResolvedValue({});

documentController.getDocumentByFileName = jest.fn()
  .mockResolvedValue({});

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

const setUpFakeApp = () => {
  const authProvider = new FakeAuthProvider(mockLogoutMethod);
  const app = new App(authProvider).createApp();
  app.use('/', routes(authProvider, fakeSessionManager()));
  return app;
};

describe('routes', () => {
  describe('GET /', () => {
    const path = '/';

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), getPath: path, expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should redirect to /organisation', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation`);
      }));
  });

  describe('GET /document/:documentName', () => {
    const path = '/document/a-document';
    beforeEach(() => {
      documentController.getDocumentByFileName = jest.fn()
        .mockResolvedValue({ on: (a, b) => b() });
    });

    afterEach(() => {
      documentController.getDocumentByFileName.mockReset();
    });

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

    it('should call getDocumentByFileName with the correct paramswhen the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .then(() => {
        expect(documentController.getDocumentByFileName.mock.calls.length).toEqual(1);
        expect(documentController.getDocumentByFileName).toHaveBeenCalledWith({
          res: expect.any(Object),
          documentName: 'a-document',
          contentType: 'application/pdf',
        });
        documentController.getDocumentByFileName.mockReset();
      }));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      }));
  });

  describe('GET /organisation', () => {
    const path = '/organisation';

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

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="dashboard-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      }));
  });

  describe('GET /organisation/:orderId', () => {
    const path = '/organisation/order-id';

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

    it('should return the neworder page with correct status when the user is authorised', () => {
      taskListController.getTaskListPageContext = jest.fn()
        .mockResolvedValueOnce({ orderId: 'neworder' });

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="neworder-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });

    it('should return the existing order page with correct status when the user is authorised', () => {
      taskListController.getTaskListPageContext = jest.fn()
        .mockResolvedValueOnce({ orderId: 'order-id' });

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="order-id-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('GET /organisation/:orderId/preview', () => {
    const path = '/organisation/order-id/preview';

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

    it('should return the correct status and text when the user is authorised', () => {
      getOrder.mockResolvedValueOnce({});

      previewController.getPreviewPageContext = jest.fn()
        .mockResolvedValueOnce({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="preview-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });

    it('should return the printable preview page when the print flag is passed in', () => {
      const pathWithPrintFlag = `${path}?print=true`;

      getOrder.mockResolvedValueOnce({});

      previewController.getPreviewPageContext = jest.fn()
        .mockResolvedValueOnce({});

      return request(setUpFakeApp())
        .get(pathWithPrintFlag)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="preview-page-print"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('GET /organisation/:orderId/delete-order', () => {
    const path = '/organisation/some-order-id/delete-order';

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

    it('should return the deleted-order page if authorised', async () => {
      getOrderDescription.mockResolvedValueOnce({});

      const res = await request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200);
      expect(res.text.includes('data-test-id="delete-order-page"')).toBeTruthy();
    });
  });

  describe('GET *', () => {
    it('should return error page if url cannot be matched', done => request(setUpFakeApp())
      .get('/aaaa')
      .expect(200)
      .then((res) => {
        expect(res.text.includes('<h1 class="nhsuk-heading-l nhsuk-u-margin-top-5" data-test-id="error-title">Incorrect url /aaaa</h1>')).toEqual(true);
        expect(res.text.includes('<p data-test-id="error-description">Please check it is valid and try again</p>')).toEqual(true);
        done();
      }));
  });
});

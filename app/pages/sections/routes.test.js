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
import { App } from '../../app';
import { routes } from '../../routes';
import { baseUrl } from '../../config';
import * as descriptionController from './description/controller';
import * as orderingPartyController from './call-off-ordering-party/controller';
import * as commencementDateController from './commencement-date/controller';

jest.mock('../../logger');

descriptionController.getDescriptionContext = jest.fn()
  .mockResolvedValue({});

descriptionController.postOrPutDescription = jest.fn()
  .mockResolvedValue({});

orderingPartyController.getCallOffOrderingPartyContext = jest.fn()
  .mockResolvedValue({});

orderingPartyController.putCallOffOrderingParty = jest.fn()
  .mockResolvedValue({});

commencementDateController.putCommencementDate = jest.fn()
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
  describe('GET /organisation/:orderId/description', () => {
    const path = '/organisation/some-order-id/description';

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
        expect(res.text.includes('data-test-id="description-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
      }));
  });

  describe('POST /organisation/neworder/description', () => {
    const path = '/organisation/neworder/description';

    afterEach(() => {
      descriptionController.postOrPutDescription.mockReset();
    });

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

    it('should return the correct status and text if response.success is true', async () => {
      descriptionController.postOrPutDescription = jest.fn()
        .mockImplementation(() => Promise.resolve({ success: true, orderId: 'order1' }));

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()), csrfPagePath: path, mockAuthorisedCookie,
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({
          description: 'a description of the order',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order1`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should return the correct status and text if response.success is not true', async () => {
      descriptionController.postOrPutDescription = jest.fn()
        .mockImplementation(() => Promise.resolve({ success: false }));

      descriptionController.getDescriptionErrorContext = jest.fn()
        .mockImplementation(() => Promise.resolve({
          errors: [{ text: 'Description too long', href: '#description' }],
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
          expect(res.text.includes('data-test-id="description-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
          descriptionController.getDescriptionErrorContext.mockReset();
        });
    });
  });

  describe('GET /organisation/:orderId/call-off-ordering-party', () => {
    const path = '/organisation/some-order-id/call-off-ordering-party';

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
        expect(res.text.includes('data-test-id="call-off-ordering-party-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
      }));
  });

  describe('POST /organisation/neworder/call-off-ordering-party', () => {
    const path = '/organisation/order-id/call-off-ordering-party';

    afterEach(() => {
      orderingPartyController.putCallOffOrderingParty.mockReset();
    });

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

    it('should return the correct status and text if response.success is true', async () => {
      orderingPartyController.putCallOffOrderingParty = jest.fn()
        .mockImplementation(() => Promise.resolve({ success: true }));

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()), csrfPagePath: path, mockAuthorisedCookie,
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

    it('should return the correct status and text if response.success is not true', async () => {
      orderingPartyController.putCallOffOrderingParty = jest.fn()
        .mockImplementation(() => Promise.resolve({ success: false }));

      orderingPartyController.getCallOffOrderingPartyErrorContext = jest.fn()
        .mockImplementation(() => Promise.resolve({
          errors: [{ text: 'First name must be 100 characters or fewer', href: '#firstName' }],
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
          expect(res.text.includes('data-test-id="call-off-ordering-party-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
          orderingPartyController.getCallOffOrderingPartyErrorContext.mockReset();
        });
    });
  });

  describe('GET /organisation/:orderId/commencement-date', () => {
    const path = '/organisation/some-order-id/commencement-date';

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
        expect(res.status).toBe(200);
        expect(res.text.includes('data-test-id="commencement-date-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
      }));
  });

  describe('POST /organisation/neworder/commencement-date', () => {
    const path = '/organisation/order-id/commencement-date';

    afterEach(() => {
      commencementDateController.putCommencementDate.mockReset();
    });

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

    it('should return the correct status and text if response.success is true', async () => {
      commencementDateController.putCommencementDate = jest.fn()
        .mockImplementation(() => Promise.resolve({ success: true }));

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()), csrfPagePath: path, mockAuthorisedCookie,
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

    it('should return the correct status and text if response.success is not true', async () => {
      commencementDateController.putCommencementDate = jest.fn()
        .mockImplementation(() => Promise.resolve({ success: false }));

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()), csrfPagePath: path, mockAuthorisedCookie,
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
});

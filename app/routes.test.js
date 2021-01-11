import request from 'supertest';
import {
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
} from 'buying-catalogue-library';
import {
  mockUnauthorisedCookie,
  mockAuthorisedCookie,
  setUpFakeApp,
} from './test-utils/routesTestHelper';
import { baseUrl } from './config';
import { getDocumentByFileName } from './helpers/api/dapi/getDocumentByFileName';

jest.mock('./logger');
jest.mock('./helpers/api/ordapi/getOrder');
jest.mock('./helpers/routes/getOrderDescription');
jest.mock('./helpers/api/dapi/getDocumentByFileName');

describe('routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

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
      getDocumentByFileName.mockResolvedValue({ on: (a, b) => b() });
    });

    afterEach(() => {
      getDocumentByFileName.mockReset();
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
        expect(getDocumentByFileName.mock.calls.length).toEqual(1);
        expect(getDocumentByFileName).toHaveBeenCalledWith({
          res: expect.any(Object),
          documentName: 'a-document',
          contentType: 'application/pdf',
        });
      }));

    it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
      }));
  });

  describe('GET *', () => {
    it('should return error page if url cannot be matched', (done) => request(setUpFakeApp())
      .get('/aaaa')
      .expect(200)
      .then((res) => {
        expect(res.text.includes('<h1 class="nhsuk-heading-l nhsuk-u-margin-top-5" data-test-id="error-title">Incorrect url /aaaa</h1>')).toEqual(true);
        expect(res.text.includes('<p data-test-id="error-description">Please check it is valid and try again</p>')).toEqual(true);
        done();
      }));
  });
});

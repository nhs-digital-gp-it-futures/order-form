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
import { getOdsCodeForOrganisation } from './helpers/controllers/odsCodeLookup';

jest.mock('./logger');
jest.mock('./helpers/api/ordapi/getOrder');
jest.mock('./helpers/routes/getOrderDescription');
jest.mock('./helpers/api/dapi/getDocumentByFileName');
jest.mock('./helpers/controllers/odsCodeLookup');
jest.mock('./helpers/api/oapi/getOrganisation');

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

  describe('GET /organisation', () => {
    const path = '/organisation';
    const odsCode = 'odsCode';

    beforeEach(() => {
      getOdsCodeForOrganisation.mockResolvedValue(odsCode);
    });

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), getPath: `${path}/{odsCode}`, expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should redirect to /organisation/odsCode if user logged in with odsCode', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/${odsCode}`);
      }));

    it('should redirect to /organisation/odsCode if user logged in with odsCode and URL ends in slash', () => request(setUpFakeApp())
      .get(`${path}/`)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/${odsCode}`);
      }));
  });

  describe('GET /organisation/select', () => {
    const path = '/organisation/select';
    const odsCode = 'J89';

    beforeEach(() => {
      getOdsCodeForOrganisation.mockResolvedValue(odsCode);
    });

    it('should redirect to /organisation/odsCode/select if user logged in with odsCode', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/${odsCode}/select`);
      }));

    it('should redirect to /organisation/odsCode/select if user logged in with odsCode and URL ends in slash', () => request(setUpFakeApp())
      .get(`${path}/`)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/${odsCode}/select`);
      }));
  });

  describe('GET /organisation/C116727-01', () => {
    const path = '/organisation/C116727-01';
    const odsCode = 'E02';

    beforeEach(() => {
      getOdsCodeForOrganisation.mockResolvedValue(odsCode);
    });

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), getPath: path, expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should redirect to /organisation/odsCode/order/{orderId}/ if user logged in with odsCode', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/${odsCode}/order/C116727-01`);
      }));

    it('should redirect to /organisation/odsCode/order/orderId if url ends in slash', () => request(setUpFakeApp())
      .get(`${path}/`)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/${odsCode}/order/C116727-01/`);
      }));
  });

  describe('GET /organisation/:orderId/summary', () => {
    const path = '/organisation/H123456-78/summary';
    const odsCode = 'W28';

    beforeEach(() => {
      getOdsCodeForOrganisation.mockResolvedValue(odsCode);
    });

    it('should redirect to /organisation/odsCode/select if user logged in with odsCode', () => request(setUpFakeApp())
      .get(path)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/${odsCode}/order/H123456-78/summary`);
      }));

    it('should redirect to /organisation/odsCode/select if user logged in with odsCode and URL ends in slash', () => request(setUpFakeApp())
      .get(`${path}/`)
      .set('Cookie', [mockAuthorisedCookie])
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/${odsCode}/order/H123456-78/summary/`);
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

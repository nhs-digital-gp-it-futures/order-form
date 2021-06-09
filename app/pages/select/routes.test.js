import request from 'supertest';
import {
  testAuthorisedGetPathForUnauthenticatedUser,
  getCsrfTokenFromGet,
} from 'buying-catalogue-library';
import {
  mockAuthorisedCookie,
  setUpFakeApp,
} from '../../test-utils/routesTestHelper';
import * as controller from './controller';
import { getOdsCodeForOrganisation, getOrganisationFromOdsCode } from '../../helpers/controllers/odsCodeLookup';
import { getProxyOrganisations } from '../../helpers/api/oapi/getProxyOrganisations';
import { baseUrl } from '../../config';
import mockOrgData from '../../test-utils/mockData/mockOrganisationData.json';

jest.mock('../../helpers/api/oapi/getRelatedOrganisations');
jest.mock('../../helpers/controllers/odsCodeLookup');
jest.mock('../../helpers/api/oapi/getRelatedOrganisations');
jest.mock('../../helpers/api/oapi/getProxyOrganisations');

describe('select organisation routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /organisation/:odsCode/select', () => {
    const path = '/organisation/odsCode/select/selectedOdsCode';
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to the login page if the user is not logged in', () => {
      getOrganisationFromOdsCode.mockResolvedValueOnce(mockOrgData);
      return testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), getPath: path, expectedRedirectPath: 'http://identity-server/login',
      });
    });

    it('should return the page with correct status when the user is authorised', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      controller.organisationsList = jest.fn()
        .mockResolvedValueOnce({ primaryName: 'abc', organisationsList: ['', ''] });
      getProxyOrganisations.mockResolvedValue([{ organisationId: '123', name: 'abc' }]);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="organisation-select-page"')).toBeTruthy();
        });
    });

    it('should return the page with op input set if set as query parameter', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      controller.organisationsList = jest.fn()
        .mockResolvedValueOnce({ primaryName: 'abc', organisationsList: ['', ''] });
      getProxyOrganisations.mockResolvedValue([{ organisationId: '123', name: 'abc' }]);

      return request(setUpFakeApp())
        .get(`${path}?op=do-some-thing`)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('<input type="hidden" name="op" value="do-some-thing" />')).toBeTruthy();
        });
    });
  });

  describe('POST /organisation/:odsCode/select', () => {
    const path = '/organisation/odsCode/select/selectedOdsCode';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to /organisation/odsCode, if the organisation is selected and op param is null', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      controller.organisationsList = jest.fn()
        .mockResolvedValueOnce({ primaryName: 'abc', organisationsList: ['', ''] });
      getProxyOrganisations.mockResolvedValue([{ organisationId: '123', name: 'abc' }]);
      getOdsCodeForOrganisation.mockResolvedValueOnce('odsCode');
      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({
          _csrf: csrfToken,
          organisation: 'orgId',
          op: 'create-order',
        })
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/neworder`);
    });

    it('should redirect to /organisation/odsCode, if the organisation is selected and is for create order op', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      controller.organisationsList = jest.fn()
        .mockResolvedValueOnce({ primaryName: 'abc', organisationsList: ['', ''] });
      getProxyOrganisations.mockResolvedValue([{ organisationId: '123', name: 'abc' }]);
      getOdsCodeForOrganisation.mockResolvedValueOnce('odsCode');
      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({
          _csrf: csrfToken,
          organisation: 'orgId',
        })
        .expect(302);

      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode`);
    });

    it('should redirect back to select page, if the organisation is not selected', async () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      controller.getSelectErrorContext = jest.fn();
      controller.organisationsList = jest.fn()
        .mockResolvedValueOnce({ primaryName: 'abc', organisationsList: ['', ''] });
      getProxyOrganisations.mockResolvedValue([{ organisationId: '123', name: 'abc' }]);
      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(controller.getSelectErrorContext).toHaveBeenCalled();
          expect(res.text.includes('data-test-id="organisation-select-page"')).toBeTruthy();
        });
    });
  });
});

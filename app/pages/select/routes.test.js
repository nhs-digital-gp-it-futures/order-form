import request from 'supertest';
import {
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
} from 'buying-catalogue-library';
import {
  mockUnauthorisedCookie,
  mockAuthorisedCookie,
  setUpFakeApp,
} from '../../test-utils/routesTestHelper';
import * as controller from './controller';
import { getOrganisationFromOdsCode } from '../../helpers/controllers/odsCodeLookup';
import { getProxyOrganisations } from '../../helpers/api/oapi/getProxyOrganisations';

jest.mock('../../helpers/api/oapi/getRelatedOrganisations');
jest.mock('../../helpers/controllers/odsCodeLookup');
jest.mock('../../helpers/api/oapi/getRelatedOrganisations');
jest.mock('../../helpers/api/oapi/getProxyOrganisations');

describe('GET /organisation/:odsCode/select', () => {
  const path = '/organisation/odsCode/select';
  afterEach(() => {
    jest.resetAllMocks();
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

  it('should return the page with correct status when the user is authorised', () => {
    getOrganisationFromOdsCode.mockResolvedValueOnce({});
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
});

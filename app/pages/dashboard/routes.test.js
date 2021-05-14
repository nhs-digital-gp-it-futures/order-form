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
import * as dashboardController from './controller';
import { getOrganisationFromOdsCode } from '../../helpers/controllers/odsCodeLookup';

jest.mock('../../helpers/controllers/odsCodeLookup');

dashboardController.getDashboardContext = jest.fn()
  .mockResolvedValueOnce({});

describe('GET /organisation/:odsCode', () => {
  const path = '/organisation/odsCode';
  beforeEach(() => {
    getOrganisationFromOdsCode.mockResolvedValueOnce({});
  });
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

  it('should return the correct status and text when the user is authorised', () => request(setUpFakeApp())
    .get(path)
    .set('Cookie', [mockAuthorisedCookie])
    .expect(200)
    .then((res) => {
      expect(res.text.includes('data-test-id="dashboard-page"')).toBeTruthy();
      expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
    }));
});

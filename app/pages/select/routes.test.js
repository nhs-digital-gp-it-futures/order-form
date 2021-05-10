import request from 'supertest';
import {
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
} from 'buying-catalogue-library';
import {
  mockUnauthorisedCookie,
  setUpFakeApp,
} from '../../test-utils/routesTestHelper';

jest.mock('../../helpers/api/oapi/getRelatedOrganisations');

describe('GET /organisation/select', () => {
  const path = '/organisation/select';
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

  // TODO: fix when routes are changed
  //   it('should return the page with correct status when the user is authorised', () => {
  //   controller.organisationsList = jest.fn()
  //     .mockResolvedValueOnce({ primaryName: 'abc', organisationsList: ['', ''] });

  //   return request(setUpFakeApp())
  //     .get(path)
  //     .set('Cookie', [mockAuthorisedCookie])
  //     .expect(200)
  //     .then((res) => {
  //       expect(res.text.includes('data-test-id="organisation-select-page"')).toBeTruthy();
  //     });
  // });
});

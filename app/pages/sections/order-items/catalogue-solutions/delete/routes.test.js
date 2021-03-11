import request from 'supertest';
import {
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthorisedUsers,
  getCsrfTokenFromGet,
} from 'buying-catalogue-library';
import {
  mockUnauthorisedCookie,
  mockAuthorisedCookie,
  setUpFakeApp,
} from '../../../../../test-utils/routesTestHelper';
import { baseUrl } from '../../../../../config';
import * as deleteCatalogueSolutionController from './controller';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

const mockGetPageDataCookie = `${sessionKeys.orderItemPageData}=${{ selectedRecipients: [{}] }}`;

describe('catalogue-solutions delete routes', () => {
  describe('POST /organisation/:orderId/catalogue-solutions/delete/:orderItemId', () => {
    const path = '/organisation/order-42/catalogue-solutions/delete/order-Item-5';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 403 forbidden if no csrf token is available', async () => {
      await testPostPathWithoutCsrf({
        app: request(setUpFakeApp()),
        postPath: path,
        postPathCookies: [mockAuthorisedCookie],
      });
    });

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

    it('should redirect to catalogue solution deletion confirmation page, if the order is deleted', async () => {
      deleteCatalogueSolutionController.deleteCatalogueSolution = jest.fn().mockResolvedValueOnce();

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockGetPageDataCookie])
        .send({
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-42/catalogue-solutions/delete/order-Item-5/confirmation`);
        });
    });
  });
});

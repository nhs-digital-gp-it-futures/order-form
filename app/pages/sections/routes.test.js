import request from 'supertest';
import {
  testAuthorisedGetPathForUnauthenticatedUser,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  testAuthorisedGetPathForUnauthorisedUser,
  getCsrfTokenFromGet,
} from 'buying-catalogue-library';
import {
  mockUnauthorisedCookie,
  mockAuthorisedCookie,
  setUpFakeApp,
} from '../../test-utils/routesTestHelper';
import { baseUrl } from '../../config';
import * as descriptionController from './description/controller';
import * as orderingPartyController from './ordering-party/controller';
import * as commencementDateController from './commencement-date/controller';
import { getFundingSource } from '../../helpers/api/ordapi/getFundingSource';
import { putFundingSource } from '../../helpers/api/ordapi/putFundingSource';
import { putOrderingParty } from '../../helpers/api/ordapi/putOrderingParty';
import { putCommencementDate } from '../../helpers/api/ordapi/putCommencementDate';
import * as fundingSourceController from './funding-source/controller';
import { getOrganisationFromOdsCode } from '../../helpers/controllers/odsCodeLookup';
import mockOrgData from '../../test-utils/mockData/mockOrganisationData.json';

jest.mock('../../logger');
jest.mock('../../helpers/api/ordapi/getFundingSource');
jest.mock('../../helpers/api/ordapi/putFundingSource');
jest.mock('../../helpers/routes/getOrderDescription');
jest.mock('../../helpers/api/ordapi/putOrderingParty');
jest.mock('../../helpers/api/ordapi/putCommencementDate');
jest.mock('../../helpers/api/ordapi/putServiceRecipients');
jest.mock('../../helpers/controllers/odsCodeLookup');

descriptionController.getDescriptionContext = jest.fn()
  .mockResolvedValue({});

descriptionController.postOrPutDescription = jest.fn()
  .mockResolvedValue({});

orderingPartyController.getCallOffOrderingPartyContext = jest.fn()
  .mockResolvedValue({});

describe('section routes', () => {
  describe('GET /organisation/:odsCode/order/:orderId/description', () => {
    const path = '/organisation/odsCode/order/some-order-id/description';

    it('should redirect to the login page if the user is not logged in', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), getPath: path, expectedRedirectPath: 'http://identity-server/login',
      });
    });

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
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="description-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/description', () => {
    const path = '/organisation/odsCode/order/:orderId/description';
    beforeEach(() => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
    });

    afterEach(() => {
      descriptionController.postOrPutDescription.mockReset();
    });

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

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

    it('should return the correct status and text if response.success is true', async () => {
      descriptionController.postOrPutDescription = jest.fn()
        .mockImplementation(() => Promise.resolve({ success: true, orderId: 'order1' }));

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
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
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order1`);
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
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
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

  describe('GET /organisation/:odsCode/order/:orderId/ordering-party', () => {
    const path = '/organisation/odsCode/order/some-order-id/ordering-party';
    beforeEach(() => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
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
        expect(res.text.includes('data-test-id="ordering-party-page"')).toBeTruthy();
        expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
      }));
  });

  describe('POST /organisation/:odsCode/order/:orderId/ordering-party', () => {
    const path = '/organisation/odsCode/order/order-id/ordering-party';
    beforeEach(() => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

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

    it('should return the correct status and text if response.success is true', async () => {
      putOrderingParty.mockResolvedValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-id`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should return the correct status and text if response.success is not true', async () => {
      putOrderingParty.mockResolvedValue({ success: false });

      orderingPartyController.getCallOffOrderingPartyErrorContext = jest.fn()
        .mockImplementation(() => Promise.resolve({
          errors: [{ text: 'First name must be 100 characters or fewer', href: '#firstName' }],
        }));

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="ordering-party-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
          orderingPartyController.getCallOffOrderingPartyErrorContext.mockReset();
        });
    });
  });

  describe('GET /organisation/:odsCode/order/:orderId/commencement-date', () => {
    const path = '/organisation/odsCode/order/some-order-id/commencement-date';

    commencementDateController.getCommencementDateContext = jest.fn()
      .mockResolvedValue({});

    it('should redirect to the login page if the user is not logged in', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), getPath: path, expectedRedirectPath: 'http://identity-server/login',
      });
    });

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
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.text.includes('data-test-id="commencement-date-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/commencement-date', () => {
    const path = '/organisation/odsCode/order/order-id/commencement-date';

    commencementDateController.validateCommencementDateForm = jest.fn()
      .mockReturnValue([]);

    putCommencementDate.mockResolvedValue({});

    commencementDateController.getCommencementDateErrorContext = jest.fn()
      .mockResolvedValue({});

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      });
    });

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      });
    });

    it('should return the correct status and text if there are no FE validation errors and the api response is successfull', async () => {
      commencementDateController.validateCommencementDateForm = jest.fn()
        .mockReturnValue([]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      putCommencementDate.mockResolvedValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/order-id`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should return the correct status and text if there are FE caught validation errors', async () => {
      commencementDateController.validateCommencementDateForm = jest.fn().mockReturnValue([{}]);
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      commencementDateController.getCommencementDateErrorContext = jest.fn().mockResolvedValue({
        errors: [{ text: 'error', field: ['year'], href: '#commencementDate' }],
      });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="commencement-date-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should return the correct status and text if the api response is unsuccessful', async () => {
      commencementDateController.validateCommencementDateForm = jest.fn()
        .mockReturnValue([]);

      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      putCommencementDate.mockResolvedValue({ success: false, errors: [{}] });

      commencementDateController.getCommencementDateErrorContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'error', field: ['year'], href: '#commencementDate' }],
        });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="commencement-date-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('GET /organisation/odsCode/order/:orderId/funding-source', () => {
    const path = '/organisation/odsCode/order/some-order-id/funding-source';

    it('should redirect to the login page if the user is not logged in', () => {
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return testAuthorisedGetPathForUnauthenticatedUser({
        app: request(setUpFakeApp()), getPath: path, expectedRedirectPath: 'http://identity-server/login',
      });
    });

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
      getFundingSource.mockResolvedValue({});
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.text.includes('data-test-id="funding-source-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:odsCode/order/:orderId/funding-source', () => {
    const path = '/organisation/odsCode/order/some-order-id/funding-source';

    it('should return 403 forbidden if no csrf token is available', () => (
      testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      })
    ));

    it('should redirect to the login page if the user is not logged in', () => (
      testAuthorisedPostPathForUnauthenticatedUser({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

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

    it('should show the funding source select price page with errors if there are validation errors', async () => {
      fundingSourceController.validateFundingSourceForm = jest.fn()
        .mockReturnValue({
          success: false,
          errors: [{}],
        });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);

      fundingSourceController
        .getFundingSourceErrorPageContext = jest.fn()
          .mockResolvedValue({
            errors: [{ text: 'Select a funding source', href: '#selectFundingSource' }],
          });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [],
      });

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(200);

      expect(res.text.includes('data-test-id="funding-source-page"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
    });

    it('should return the correct status and text when the FE validation and the API call are both successful', async () => {
      fundingSourceController.validateFundingSourceForm = jest.fn()
        .mockReturnValue({ success: true });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      putFundingSource.mockResolvedValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/odsCode/order/some-order-id`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should return the correct status and text when FE validation successful but API call returned an error', async () => {
      fundingSourceController.validateFundingSourceForm = jest.fn()
        .mockReturnValue({ success: true });
      getOrganisationFromOdsCode.mockResolvedValue(mockOrgData);
      putFundingSource.mockResolvedValue({ success: false, errors: [{}] });

      fundingSourceController
        .getFundingSourceErrorPageContext = jest.fn()
          .mockResolvedValue({
            errors: [{ text: 'error', href: '#selectFundingSource' }],
          });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie],
        postPathCookies: [],
      });

      const res = await request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie])
        .send({ _csrf: csrfToken })
        .expect(200);

      expect(res.text.includes('data-test-id="funding-source-page"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
      expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
    });
  });
});

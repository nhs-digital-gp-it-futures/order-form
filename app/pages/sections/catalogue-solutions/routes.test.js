import request from 'supertest';
import {
  FakeAuthProvider,
  testAuthorisedGetPathForUnauthenticatedUser,
  testAuthorisedGetPathForUnauthorisedUser,
  fakeSessionManager,
  testPostPathWithoutCsrf,
  testAuthorisedPostPathForUnauthenticatedUser,
  testAuthorisedPostPathForUnauthorisedUsers,
  getCsrfTokenFromGet,
} from 'buying-catalogue-library';
import * as catalogueSolutionsController from './catalogue-solutions/controller';
import * as catalogueSolutionPriceController from './price/controller';
import * as selectSolutionController from './solution/controller';
import * as selectRecipientController from './recipient/controller';
import { App } from '../../../app';
import { routes } from '../../../routes';
import { baseUrl } from '../../../config';

jest.mock('../../../logger');

const mockLogoutMethod = jest.fn().mockResolvedValue({});

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

const mockSolutionsFoundState = JSON.stringify([
  { id: 'solution-1', name: 'Solution 1' },
  { id: 'solution-2', name: 'Solution 2' },
]);

const mockSolutionsFoundCookie = `suppliersFound=${mockSolutionsFoundState}`;

const mockRecipientsFoundState = JSON.stringify([
  { id: 'recipient-1', name: 'Recipient 1' },
  { id: 'recipient-2', name: 'Recipient 2' },
]);

const mockRecipientsFoundCookie = `recipients=${mockRecipientsFoundState}`;

const mockSelectedSolutionCookie = 'selectedSolutionId=solution-1';
const mockSolutionPrices = JSON.stringify({
  id: 'sol-1',
  name: 'Solution name',
  prices: [
    {
      priceId: '0001',
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'patient',
        description: 'per patient',
      },
      timeUnit: {
        name: 'year',
        description: 'per year',
      },
      price: 1.64,
    },
    {
      priceId: '0002',
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'licence',
        description: 'per licence',
      },
      price: 525.052,
    },
  ],
});
const mocksolutionPricesCookie = `solutionPrices=${mockSolutionPrices}`;

const setUpFakeApp = () => {
  const authProvider = new FakeAuthProvider(mockLogoutMethod);
  const app = new App(authProvider).createApp();
  app.use('/', routes(authProvider, fakeSessionManager()));
  return app;
};

describe('catalogue-solutions section routes', () => {
  describe('GET /organisation/:orderId/catalogue-solutions', () => {
    const path = '/organisation/some-order-id/catalogue-solutions';

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

    it('should return the catalogue-solutions page if authorised', () => {
      catalogueSolutionsController.getCatalogueSolutionsPageContext = jest.fn()
        .mockResolvedValue({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="catalogue-solutions-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/catalogue-solutions', () => {
    const path = '/organisation/order-id/catalogue-solutions';
    afterEach(() => {
      catalogueSolutionsController.getCatalogueSolutionsPageContext.mockRestore();
    });

    it('should return 403 forbidden if no csrf token is available', () => {
      catalogueSolutionsController.putCatalogueSolutions = jest.fn()
        .mockResolvedValue({});

      return testPostPathWithoutCsrf({
        app: request(setUpFakeApp()), postPath: path, postPathCookies: [mockAuthorisedCookie],
      });
    });

    it('should redirect to the login page if the user is not logged in', () => {
      catalogueSolutionsController.putCatalogueSolutions = jest.fn()
        .mockResolvedValue({});

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
      catalogueSolutionsController.putCatalogueSolutions = jest.fn()
        .mockResolvedValue({});

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

    it('should return the correct status and text if response.success is true', async () => {
      catalogueSolutionsController.putCatalogueSolutions = jest.fn()
        .mockResolvedValue({ success: true });

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
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-id`);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });
  });

  describe('GET /organisation/:orderId/catalogue-solutions/solution', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/solution';

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

    it('should return the catalogue-solutions select-solution page if authorised', () => {
      selectSolutionController.getSolutionsSelectPageContext = jest.fn()
        .mockResolvedValue({});

      selectSolutionController.getSupplierId = jest.fn()
        .mockResolvedValue('supp-1');

      selectSolutionController.findSolutions = jest.fn()
        .mockResolvedValue([]);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-select-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/catalogue-solutions/solution', () => {
    const path = '/organisation/order-1/catalogue-solutions/solution';

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
        getPathCookies: [mockAuthorisedCookie, mockSolutionsFoundCookie],
        postPathCookies: [mockSolutionsFoundCookie],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
      testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsFoundCookie],
        postPathCookies: [mockUnauthorisedCookie],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      })
    ));

    it('should show the solution select page with errors if there are validation errors', async () => {
      selectSolutionController.validateSolutionSelectForm = jest.fn()
        .mockReturnValue({ success: false });

      selectSolutionController.getSolutionsSelectErrorPageContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'Select a solution', href: '#selectSolution' }],
        });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsFoundCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsFoundCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-select-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/some-order-id/catalogue-solutions/solution/price if a solution is selected', async () => {
      selectSolutionController.validateSolutionSelectForm = jest.fn()
        .mockReturnValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [mockAuthorisedCookie, mockSolutionsFoundCookie],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsFoundCookie])
        .send({
          selectSolution: 'solution-1',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/solution/price`);
        });
    });
  });

  describe('GET /organisation/:orderId/catalogue-solutions/solution/price', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/solution/price';

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

    it('should return the catalogue-solutions select price page if authorised', () => {
      catalogueSolutionPriceController.getSolutionPricePageContext = jest.fn()
        .mockResolvedValue({});

      catalogueSolutionPriceController.findSolutionPrices = jest.fn()
        .mockResolvedValue([]);

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie, mockSolutionsFoundCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-price-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('GET /organisation/:orderId/catalogue-solutions/solution/price/recipient', () => {
    const path = '/organisation/some-order-id/catalogue-solutions/solution/price/recipient';

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

    it('should return the catalogue-solutions select recipient page if authorised', () => {
      selectRecipientController.getSolution = jest.fn()
        .mockResolvedValue({});

      selectRecipientController.getRecipients = jest.fn()
        .mockResolvedValue([]);

      selectRecipientController.getSolutionRecipientPageContext = jest.fn()
        .mockResolvedValue({});

      return request(setUpFakeApp())
        .get(path)
        .set('Cookie', [mockAuthorisedCookie])
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-recipient-page"')).toBeTruthy();
          expect(res.text.includes('data-test-id="error-title"')).toBeFalsy();
        });
    });
  });

  describe('POST /organisation/:orderId/catalogue-solutions/solution/price/recipient', () => {
    const path = '/organisation/order-1/catalogue-solutions/solution/price/recipient';

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
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsFoundCookie, mockSelectedSolutionCookie,
        ],
        postPathCookies: [mockRecipientsFoundCookie, mockSelectedSolutionCookie],
        expectedRedirectPath: 'http://identity-server/login',
      })
    ));

    it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => {
      selectRecipientController.getSolution = jest.fn()
        .mockResolvedValue({ name: 'Solution One ' });

      selectRecipientController.getRecipients = jest.fn()
        .mockResolvedValue([]);

      return testAuthorisedPostPathForUnauthorisedUsers({
        app: request(setUpFakeApp()),
        getPath: path,
        postPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsFoundCookie, mockSelectedSolutionCookie,
        ],
        postPathCookies: [
          mockUnauthorisedCookie, mockRecipientsFoundCookie, mockSelectedSolutionCookie,
        ],
        expectedPageId: 'data-test-id="error-title"',
        expectedPageMessage: 'You are not authorised to view this page',
      });
    });

    it('should show the recipient select page with errors if there are validation errors', async () => {
      selectRecipientController.getRecipients = jest.fn()
        .mockResolvedValue([]);

      selectRecipientController.validateRecipientSelectForm = jest.fn()
        .mockReturnValue({ success: false });

      selectRecipientController.getSolution = jest.fn()
        .mockResolvedValue({ name: 'Solution One ' });

      selectRecipientController.getRecipientSelectErrorPageContext = jest.fn()
        .mockResolvedValue({
          errors: [{ text: 'Select a recipient', href: '#selectRecipient' }],
        });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsFoundCookie, mockSelectedSolutionCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockRecipientsFoundCookie, mockSelectedSolutionCookie])
        .send({ _csrf: csrfToken })
        .expect(200)
        .then((res) => {
          expect(res.text.includes('data-test-id="solution-recipient-page"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
          expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
        });
    });

    it('should redirect to /organisation/some-order-id/catalogue-solutions/newsolution if a recipient is selected', async () => {
      selectRecipientController.getSolution = jest.fn()
        .mockResolvedValue({ name: 'Solution One ' });

      selectRecipientController.getRecipients = jest.fn()
        .mockResolvedValue([]);

      selectRecipientController.validateRecipientSelectForm = jest.fn()
        .mockReturnValue({ success: true });

      const { cookies, csrfToken } = await getCsrfTokenFromGet({
        app: request(setUpFakeApp()),
        getPath: path,
        getPathCookies: [
          mockAuthorisedCookie, mockRecipientsFoundCookie, mockSelectedSolutionCookie,
        ],
      });

      return request(setUpFakeApp())
        .post(path)
        .type('form')
        .set('Cookie', [cookies, mockAuthorisedCookie, mockRecipientsFoundCookie, mockSelectedSolutionCookie])
        .send({
          selectRecipient: 'recipient-1',
          _csrf: csrfToken,
        })
        .expect(302)
        .then((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/newsolution`);
        });
    });
  });
});

describe('POST /organisation/:orderId/catalogue-solutions/solution/price', () => {
  const path = '/organisation/order-1/catalogue-solutions/solution/price';

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
      getPathCookies: [mockAuthorisedCookie, mockSolutionsFoundCookie],
      postPathCookies: [mocksolutionPricesCookie],
      expectedRedirectPath: 'http://identity-server/login',
    })
  ));

  it('should show the error page indicating the user is not authorised if the user is logged in but not authorised', () => (
    testAuthorisedPostPathForUnauthorisedUsers({
      app: request(setUpFakeApp()),
      getPath: path,
      postPath: path,
      getPathCookies: [mockAuthorisedCookie, mockSolutionsFoundCookie],
      postPathCookies: [mockUnauthorisedCookie],
      expectedPageId: 'data-test-id="error-title"',
      expectedPageMessage: 'You are not authorised to view this page',
    })
  ));

  it('should show the solution select page with errors if there are validation errors', async () => {
    catalogueSolutionPriceController.validateSolutionSelectPriceForm = jest.fn()
      .mockReturnValue({ success: false });

    catalogueSolutionPriceController.findSolutionPrices = jest.fn()
      .mockResolvedValue([]);

    catalogueSolutionPriceController.getSolutionPriceErrorPageContext = jest.fn()
      .mockResolvedValue({
        errors: [{ text: 'Select a List price', href: '#selectSolutionPrice' }],
      });

    const { cookies, csrfToken } = await getCsrfTokenFromGet({
      app: request(setUpFakeApp()),
      getPath: path,
      getPathCookies: [mockAuthorisedCookie, mockSolutionsFoundCookie],
    });

    return request(setUpFakeApp())
      .post(path)
      .type('form')
      .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsFoundCookie, mocksolutionPricesCookie])
      .send({ _csrf: csrfToken })
      .expect(200)
      .then((res) => {
        expect(res.text.includes('data-test-id="solution-price-page"')).toEqual(true);
        expect(res.text.includes('data-test-id="error-summary"')).toEqual(true);
        expect(res.text.includes('data-test-id="error-title"')).toEqual(false);
      });
  });

  it('should redirect to /organisation/some-order-id/catalogue-solutions/solution/price if a solution is selected', async () => {
    catalogueSolutionPriceController.validateSolutionSelectPriceForm = jest.fn()
      .mockReturnValue({ success: true });

    const { cookies, csrfToken } = await getCsrfTokenFromGet({
      app: request(setUpFakeApp()),
      getPath: path,
      getPathCookies: [mockAuthorisedCookie, mockSolutionsFoundCookie],
    });

    return request(setUpFakeApp())
      .post(path)
      .type('form')
      .set('Cookie', [cookies, mockAuthorisedCookie, mockSolutionsFoundCookie, mocksolutionPricesCookie])
      .send({
        selectSolutionPrice: '0001',
        _csrf: csrfToken,
      })
      .expect(302)
      .then((res) => {
        expect(res.redirect).toEqual(true);
        expect(res.headers.location).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/solution/price/recipient`);
      });
  });
});

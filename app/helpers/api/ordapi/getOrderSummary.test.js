import request from 'supertest';
import { getData, getCsrfTokenFromGet } from 'buying-catalogue-library';
import {
  mockAuthorisedCookie,
  setUpFakeApp,
} from '../../../test-utils/routesTestHelper';
import { getOrganisationFromOdsCode } from '../../controllers/odsCodeLookup';
import { getOrderSummary } from './getOrderSummary';
import config from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');
jest.mock('../../../helpers/controllers/odsCodeLookup', () => ({
  getOrganisationFromOdsCode: jest.fn(),
}));

const req = {};
const fakeSessionManager = {};

describe('getOrderSummary', () => {
  beforeEach(() => {
    fakeSessionManager.getFromSession = () => { };
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  const accessToken = 'access_token';
  const orderId = 'order-id';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce({});
    getOrganisationFromOdsCode.mockResolvedValueOnce({ organisationId: '10001' });

    await getOrderSummary({
      orderId, accessToken, odsCode: '03F', sessionManager: fakeSessionManager, req,
    });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${config.orderApiUrl}/api/v1/orders/order-id/summary`,
      accessToken,
      logger,
    });
  });

  it('should return the expected orderSummaryData', async () => {
    getOrganisationFromOdsCode.mockResolvedValueOnce({ organisationId: '10001' });
    getData.mockResolvedValueOnce({
      orderId: 'order-id',
      description: 'some-order-data',
      sections: [],
      sectionStatus: 'some status',
      organisationId: '10001',
    });

    const orderData = await getOrderSummary({
      orderId, accessToken, odsCode: '03F', sessionManager: fakeSessionManager, req,
    });

    expect(orderData).toEqual({
      orderId: 'order-id',
      description: 'some-order-data',
      sections: [],
      enableSubmitButton: false,
    });
  });

  it('should return the enableSubmitButton property as true when API supplies a sectionStatus of complete', async () => {
    getOrganisationFromOdsCode.mockResolvedValueOnce({ organisationId: '10001' });
    getData.mockResolvedValueOnce({
      description: 'some-order-data',
      sectionStatus: 'complete',
      organisationId: '10001',
      orderId: 'order-id',
    });

    const orderData = await getOrderSummary({
      orderId, accessToken, odsCode: '03F', sessionManager: fakeSessionManager, req,
    });

    expect(orderData.enableSubmitButton).toEqual(true);
  });

  it('should return the undefined when organisationId of odscode  in url is different from ordersummaydata', async () => {
    getOrganisationFromOdsCode.mockResolvedValueOnce({ organisationId: '10001' });
    getData.mockResolvedValueOnce({
      orderId: 'order-id',
      description: 'some-order-data',
      sections: [],
      sectionStatus: 'some status',
      organisationId: '10002',
    });

    const orderData = await getOrderSummary({
      orderId, accessToken, odsCode: '03F', sessionManager: fakeSessionManager, req,
    });

    expect(orderData).toEqual(undefined);
  });

  it('should redirect to orders page when orderid of url is not same as order id present in ordersummary', async () => {
    try {
      getOrganisationFromOdsCode.mockResolvedValueOnce({ organisationId: '10001' });
      getData.mockResolvedValueOnce({
        orderId: 'order123',
        description: 'some-order-data',
        sections: [],
        sectionStatus: 'some status',
        organisationId: '10002',
      });
    } catch {
      const path = `${config.baseUrl}/organisation/order-id`;
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
        });
      expect(res.redirect).toEqual(true);
      expect(res.headers.location).toEqual(`${config.baseUrl}/organisation/`);
    }
  });
});

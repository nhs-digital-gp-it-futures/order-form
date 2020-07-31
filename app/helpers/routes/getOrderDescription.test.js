import { fakeSessionManager } from 'buying-catalogue-library';
import { getOrderDescription } from './getOrderDescription';
import { logger } from '../../logger';
import { getOrderDescription as getOrderDescriptionFromApi } from '../api/ordapi/getOrderDescription';
import { getFromSessionOrApi, sessionKeys } from './sessionHelper';

jest.mock('../../logger');
jest.mock('../api/ordapi/getOrderDescription', () => ({
  getOrderDescription: jest.fn(),
}));

jest.mock('../routes/sessionHelper', () => ({
  getFromSessionOrApi: jest.fn(),
  sessionKeys: jest.requireActual(),
}));

describe('getOrderDescription', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getOrderDescription (ORDAPI) with the correct params', async () => {
    getOrderDescriptionFromApi.mockResolvedValueOnce({ description: 'A description' });
    getFromSessionOrApi.mockImplementation(async ({ apiCall }) => apiCall());

    const orderId = 'order-1';
    const req = { params: { orderId } };
    const accessToken = 'access-token';

    await getOrderDescription({
      req,
      sessionManager: fakeSessionManager,
      accessToken,
      logger,
    });

    expect(getOrderDescriptionFromApi.mock.calls.length).toEqual(1);
    expect(getOrderDescriptionFromApi).toHaveBeenCalledWith({ orderId, accessToken, logger });
  });

  it('should return the expected result from the API', async () => {
    const description = 'Order description';

    getOrderDescriptionFromApi.mockResolvedValueOnce({ description });
    getFromSessionOrApi.mockImplementation(async ({ apiCall }) => apiCall());

    const actualResult = await getOrderDescription({
      req: { params: { orderId: 'order-1' } },
      sessionManager: fakeSessionManager,
      accessToken: 'access-token',
      logger,
    });

    expect(actualResult).toEqual(description);
  });

  it('should call getFromSessionOrApi with the correct params', async () => {
    const orderId = 'order-1';
    const req = { params: { orderId } };
    const sessionData = { req, key: sessionKeys.orderDescription };

    await getOrderDescription({
      req,
      sessionManager: fakeSessionManager,
      accessToken: 'access-token',
      logger,
    });

    expect(getFromSessionOrApi.mock.calls.length).toEqual(1);
    expect(getFromSessionOrApi).toHaveBeenCalledWith({
      sessionData,
      sessionManager: fakeSessionManager,
      apiCall: expect.anything(),
    });
  });

  it('should return the expected result', async () => {
    const description = 'Order description';
    getFromSessionOrApi.mockResolvedValueOnce(description);

    const actualResult = await getOrderDescription({
      req: { params: { orderId: 'order-1' } },
      sessionManager: fakeSessionManager,
      accessToken: 'access-token',
      logger,
    });

    expect(actualResult).toEqual(description);
  });
});

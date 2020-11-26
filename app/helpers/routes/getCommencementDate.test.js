import { fakeSessionManager } from 'buying-catalogue-library';
import { getCommencementDate } from './getCommencementDate';
import { logger } from '../../logger';
import { getCommencementDate as getCommencementDateFromApi } from '../api/ordapi/getCommencementDate';
import { getFromSessionOrApi, sessionKeys } from './sessionHelper';

jest.mock('../../logger');
jest.mock('../api/ordapi/getCommencementDate', () => ({
  getCommencementDate: jest.fn(),
}));

jest.mock('../routes/sessionHelper', () => ({
  getFromSessionOrApi: jest.fn(),
  sessionKeys: jest.requireActual(),
}));

describe('getCommencementDate', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getCommencementDate (ORDAPI) with the correct params', async () => {
    getCommencementDateFromApi.mockResolvedValueOnce('2020-12-20');
    getFromSessionOrApi.mockImplementation(async ({ apiCall }) => apiCall());

    const orgId = '10001';
    const req = { user: { primaryOrganisationId: orgId } };
    const accessToken = 'access-token';

    await getCommencementDate({
      req,
      sessionManager: fakeSessionManager,
      accessToken,
      logger,
    });

    expect(getCommencementDateFromApi.mock.calls.length).toEqual(1);
    expect(getCommencementDateFromApi).toHaveBeenCalledWith({ orgId, accessToken, logger });
  });

  it('should return the expected result from the API', async () => {
    const date = '2020-12-20';
    getCommencementDateFromApi.mockResolvedValueOnce(date);
    getFromSessionOrApi.mockImplementation(async ({ apiCall }) => apiCall());

    const actualResult = await getCommencementDate({
      req: { user: { primaryOrganisationId: '10002' } },
      sessionManager: fakeSessionManager,
      accessToken: 'access-token',
      logger,
    });

    expect(actualResult).toEqual(date);
  });

  it('should call getFromSessionOrApi with the correct params', async () => {
    const orgId = '10003';
    const req = { params: { orgId } };
    const sessionData = { req, key: sessionKeys.plannedDeliveryDate };

    await getCommencementDate({
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
    const date = '2020-12-20';
    getFromSessionOrApi.mockResolvedValueOnce(date);

    const actualResult = await getCommencementDate({
      req: { params: { orderId: '10004' } },
      sessionManager: fakeSessionManager,
      accessToken: 'access-token',
      logger,
    });

    expect(actualResult).toEqual(date);
  });
});

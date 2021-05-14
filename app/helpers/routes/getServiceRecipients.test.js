import { fakeSessionManager } from 'buying-catalogue-library';
import { getServiceRecipients } from './getServiceRecipients';
import { logger } from '../../logger';
import { getServiceRecipients as getServiceRecipientsFromApi } from '../api/oapi/getServiceRecipients';
import { getFromSessionOrApi, sessionKeys } from './sessionHelper';
import { getOrganisationFromOdsCode } from '../controllers/odsCodeLookup';

jest.mock('../../logger');
jest.mock('../api/oapi/getServiceRecipients', () => ({
  getServiceRecipients: jest.fn(),
}));

jest.mock('../routes/sessionHelper', () => ({
  getFromSessionOrApi: jest.fn(),
  sessionKeys: jest.requireActual(),
}));
jest.mock('../controllers/odsCodeLookup', () => ({
  getOrganisationFromOdsCode: jest.fn(),
}));

describe('getServiceRecipients', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getServiceRecipients (OAPI) with the correct params', async () => {
    const orgId = '10001';
    getOrganisationFromOdsCode.mockResolvedValueOnce({ organisationId: orgId });
    getServiceRecipientsFromApi.mockResolvedValueOnce([{ name: 'Name', odsCode: '00A' }]);
    getFromSessionOrApi.mockImplementation(async ({ apiCall }) => apiCall());

    const req = { user: '' };
    const accessToken = 'access-token';
    await getServiceRecipients({
      req,
      sessionManager: fakeSessionManager,
      accessToken,
      logger,
      odsCode: '00A',
    });

    expect(getServiceRecipientsFromApi.mock.calls.length).toEqual(1);
    expect(getServiceRecipientsFromApi).toHaveBeenCalledWith({ orgId, accessToken, logger });
  });

  it('should return the expected result from the API', async () => {
    const recipients = [{ name: 'Name', odsCode: '00B' }];
    getOrganisationFromOdsCode.mockResolvedValueOnce({ organisationId: '10001' });
    getServiceRecipientsFromApi.mockResolvedValueOnce(recipients);
    getFromSessionOrApi.mockImplementation(async ({ apiCall }) => apiCall());

    const actualResult = await getServiceRecipients({
      req: { user: '' },
      sessionManager: fakeSessionManager,
      accessToken: 'access-token',
      logger,
      odsCode: '00A',
    });

    expect(actualResult).toEqual(recipients);
  });

  it('should call getFromSessionOrApi with the correct params', async () => {
    const orgId = '10003';
    const req = { params: { orgId } };
    const sessionData = { req, key: sessionKeys.recipients };

    await getServiceRecipients({
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
    const recipients = [{ name: 'Name', odsCode: '00C' }];
    getFromSessionOrApi.mockResolvedValueOnce(recipients);

    const actualResult = await getServiceRecipients({
      req: { params: { orderId: '10004' } },
      sessionManager: fakeSessionManager,
      accessToken: 'access-token',
      logger,
    });

    expect(actualResult).toEqual(recipients);
  });
});

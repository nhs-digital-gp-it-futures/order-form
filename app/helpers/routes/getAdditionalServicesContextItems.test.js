import { getAdditionalServicesContextItems } from './getAdditionalServicesContextItems';
import { logger } from '../../logger';
import { getServiceRecipients as getServiceRecipientsFromApi } from './getServiceRecipients';
import { sessionKeys } from './sessionHelper';

const fakeSessionManager = {
  clearFromSession: jest.fn(),
  getFromSession: jest.fn(),
};

jest.mock('../../helpers/routes/getServiceRecipients', () => ({
  getServiceRecipients: jest.fn(),
}));

jest.mock('../routes/sessionHelper', () => ({
  sessionKeys: jest.requireActual(),
}));

describe('getAdditionalServicesContextItems', () => {
  const req = jest.fn();
  const accessToken = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should clear recipients from session', async () => {
    await getAdditionalServicesContextItems({
      req,
      accessToken,
      sessionManager: fakeSessionManager,
      logger,
    });

    expect(fakeSessionManager.clearFromSession)
      .toHaveBeenCalledWith({ req: expect.anything(), keys: [sessionKeys.recipients] });
  });

  it('should retrieve service recipients', async () => {
    const mockRecipients = jest.fn();
    getServiceRecipientsFromApi.mockReturnValueOnce(mockRecipients);

    const actual = await getAdditionalServicesContextItems({
      req,
      accessToken,
      sessionManager: fakeSessionManager,
      logger,
    });

    expect(getServiceRecipientsFromApi.mock.calls.length).toEqual(1);
    expect(getServiceRecipientsFromApi).toHaveBeenCalledWith({
      req, accessToken, sessionManager: fakeSessionManager, logger,
    });
    expect(actual.serviceRecipients).toEqual(mockRecipients);
  });
});

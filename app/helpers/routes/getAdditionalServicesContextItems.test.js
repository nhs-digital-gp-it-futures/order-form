import {
  getAdditionalServicesContextItems,
  getAdditionalServicesPriceContextItemsFromSession,
} from './getAdditionalServicesContextItems';
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

describe('getAdditionalServicesPriceContextItemsFromSession', () => {
  const req = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should get estimationPeriod from session', () => {
    const expected = jest.fn();
    fakeSessionManager.getFromSession = () => expected;

    const actual = getAdditionalServicesPriceContextItemsFromSession({
      req, sessionManager: fakeSessionManager,
    });

    expect(actual.formData.selectEstimationPeriod).toEqual(expected);
  });

  it('should get item name from session', () => {
    fakeSessionManager.getFromSession = () => 'some item name';

    const actual = getAdditionalServicesPriceContextItemsFromSession({
      req, sessionManager: fakeSessionManager,
    });

    expect(actual.itemName).toEqual('some item name');
  });

  it('should get selectedPrice from session', () => {
    const expected = jest.fn();
    fakeSessionManager.getFromSession = () => expected;

    const actual = getAdditionalServicesPriceContextItemsFromSession({
      req, sessionManager: fakeSessionManager,
    });

    expect(actual.selectedPrice).toEqual(expected);
  });

  it('should get quantity from session', () => {
    fakeSessionManager.getFromSession = () => 8493;

    const actual = getAdditionalServicesPriceContextItemsFromSession({
      req, sessionManager: fakeSessionManager,
    });

    expect(actual.formData.quantity).toEqual(8493);
  });
});

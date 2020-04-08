import { status } from '../status';
import { getReadyStatus } from './getReadyStatus';
import * as apiProvider from '../../../apiProvider';

jest.mock('../../../apiProvider', () => ({
  getData: jest.fn(),
}));

describe('getReadyStatus', () => {
  afterEach(() => {
    apiProvider.getData.mockReset();
  });

  it('should call getData once with the correct params', async () => {
    await getReadyStatus();
    expect(apiProvider.getData.mock.calls.length).toEqual(1);
    expect(apiProvider.getData).toHaveBeenNthCalledWith(1, { endpointLocator: 'getIdentityApiHealth' });
  });

  it('should return "Healthy" when IdentityApi is "Healthy"', async () => {
    apiProvider.getData
      .mockReturnValueOnce(status.healthy.message);

    expect(await getReadyStatus()).toBe(status.healthy);
  });

  it('should return "Unhealthy" when IdentityApi is "Unhealthy"', async () => {
    apiProvider.getData
      .mockReturnValueOnce(status.unhealthy.message)
      .mockReturnValueOnce(status.healthy.message);

    expect(await getReadyStatus()).toBe(status.unhealthy);
  });
});

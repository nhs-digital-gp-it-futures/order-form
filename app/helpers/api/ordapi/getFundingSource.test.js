import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';
import { getFundingSource } from './getFundingSource';

jest.mock('buying-catalogue-library');

describe('getFundingSource', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const accessToken = 'access_token';
  const orderId = 'order-id';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce({ onlyGMS: true });

    await getFundingSource({ orderId, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-id/funding-source`,
      accessToken,
      logger,
    });
  });

  it('should return the expected result', async () => {
    const expectedFundingSource = true;
    getData.mockResolvedValueOnce({ onlyGMS: true });

    const fundingSource = await getFundingSource({ orderId, accessToken });
    expect(fundingSource).toEqual(expectedFundingSource);
  });
});

import { getData } from 'buying-catalogue-library';
import { getCommencementDate } from './getCommencementDate';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getCommencementDate', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getData once with the correct params', async () => {
    getData.mockResolvedValueOnce({ data: {} });

    await getCommencementDate({ orderId: 'order-1', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-1/sections/commencement-date`,
      accessToken: 'access_token',
      logger,
    });
  });
});

import { getData } from 'buying-catalogue-library';
import { getRecipients } from './getRecipients';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getRecipients', () => {
  it('should call getData once with the correct params', async () => {
    getData
      .mockResolvedValueOnce({ data: {} });

    await getRecipients({ orderId: 'order-1', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-1/sections/service-recipients`,
      accessToken: 'access_token',
      logger,
    });
  });
});

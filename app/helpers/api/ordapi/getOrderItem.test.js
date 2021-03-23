import { getData } from 'buying-catalogue-library';
import { getOrderItem } from './getOrderItem';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getOrderItem', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getData once with the correct params', async () => {
    getData
      .mockResolvedValueOnce({ data: {} });

    await getOrderItem({ orderId: 'order-1', catalogueSolutionId: 'solution-id', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-1/order-items/solution-id`,
      accessToken: 'access_token',
      logger,
    });
  });
});

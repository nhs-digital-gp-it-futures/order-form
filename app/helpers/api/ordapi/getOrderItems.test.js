import { getData } from 'buying-catalogue-library';
import { getOrderItems } from './getOrderItems';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getOrderItems', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getData once with no catalogue item type', async () => {
    getData
      .mockResolvedValueOnce({ data: [] });

    await getOrderItems({ orderId: 'order-1', catalogueItemType: undefined, accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-1/order-items`,
      accessToken: 'access_token',
      logger,
    });
  });

  it('should call getData once with the correct params', async () => {
    getData
      .mockResolvedValueOnce({ data: [] });

    await getOrderItems({ orderId: 'order-1', catalogueItemType: 'Solution', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-1/order-items?catalogueItemType=Solution`,
      accessToken: 'access_token',
      logger,
    });
  });
});

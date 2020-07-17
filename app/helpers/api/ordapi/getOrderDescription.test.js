import { getData } from 'buying-catalogue-library';
import { getOrderDescription } from './getOrderDescription';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getOrderDescription', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getData once with the correct params', async () => {
    getData
      .mockResolvedValueOnce({ data: {} });

    await getOrderDescription({ orderId: 'order-1', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-1/sections/description`,
      accessToken: 'access_token',
      logger,
    });
  });

  it('should return order description', async () => {
    getData
      .mockResolvedValueOnce({ description: 'some description' });

    const actual = await getOrderDescription({ orderId: 'order-1', accessToken: 'access_token' });
    expect(actual).toEqual({ description: 'some description' });
  });

  it('should return undefined when order description is undefined', async () => {
    getData
      .mockResolvedValueOnce(undefined);

    const actual = await getOrderDescription({ orderId: 'order-1', accessToken: 'access_token' });
    expect(actual).toEqual(undefined);
  });
});

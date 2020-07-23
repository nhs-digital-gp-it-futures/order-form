import { getData } from 'buying-catalogue-library';
import { getOrder } from './getOrder';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getOrder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const accessToken = 'access_token';
  const orderId = 'order-id';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce({});

    await getOrder({ orderId, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-id`,
      accessToken,
      logger,
    });
  });
});

import { getData } from 'buying-catalogue-library';
import { getCallOffOrderingParty } from './getCallOffOrderingParty';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getCallOffOrderingParty', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getData once with the correct params', async () => {
    getData
      .mockResolvedValueOnce({ data: {} });

    await getCallOffOrderingParty({ orderId: 'order-1', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-1/sections/ordering-party`,
      accessToken: 'access_token',
      logger,
    });
  });
});

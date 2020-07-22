import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';
import { getSupplier } from './getSupplier';

jest.mock('buying-catalogue-library');

describe('getSupplier', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const accessToken = 'access_token';
  const orderId = 'order-id';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce({ supplierId: 'supp-1' });

    await getSupplier({ orderId, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/supplier`,
      accessToken,
      logger,
    });
  });

  it('should return the expected result', async () => {
    const expectedSupplier = { supplierId: 'supp-1' };
    getData.mockResolvedValueOnce(expectedSupplier);

    const supplier = await getSupplier({ orderId, accessToken });
    expect(supplier).toEqual(expectedSupplier);
  });
});

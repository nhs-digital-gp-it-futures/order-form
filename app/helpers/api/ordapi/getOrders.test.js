import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';
import { getOrders } from './getOrders';

jest.mock('buying-catalogue-library');

describe('getOrders', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const accessToken = 'access_token';
  const orgId = 'org-id';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce([]);

    await getOrders({ orgId, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/organisations/org-id/orders`,
      accessToken,
      logger,
    });
  });

  it('should return the expected result', async () => {
    const expectedOrdersData = [];
    getData.mockResolvedValueOnce([]);

    const ordersData = await getOrders({ orgId, accessToken });
    expect(ordersData).toEqual(expectedOrdersData);
  });
});

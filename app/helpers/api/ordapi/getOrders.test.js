import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';
import { getOrders, groupOrdersByStatus } from './getOrders';

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
    getData.mockResolvedValueOnce([]);

    const { completedOrders, incompletedOrders } = await getOrders({ orgId, accessToken });
    expect(completedOrders).toEqual([]);
    expect(incompletedOrders).toEqual([]);
  });
});

describe('groupOrdersByStatus', () => {
  it('should group complete and incomplete orders', () => {
    const order1 = { id: 1, status: 'Complete' };
    const order2 = { id: 2, status: 'Incomplete' };
    const order3 = { id: 3, status: 'Incomplete' };
    const order4 = { id: 4, status: 'Incomplete' };

    const orders = [order1, order2, order3, order4];

    const { completedOrders, incompletedOrders } = groupOrdersByStatus(orders);

    expect(completedOrders).toEqual([order1]);
    expect(incompletedOrders).toEqual([order2, order3, order4]);
  });
});

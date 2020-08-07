import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';
import { getOrders, groupOrdersByStatus } from './getOrders';

jest.mock('buying-catalogue-library');

const order1 = {
  id: 1, status: 'Complete', dateCreated: '2020-01-06T09:29:52.4965653Z', dateCompleted: '2020-02-05T09:29:52.4965653Z',
};
const order2 = {
  id: 2, status: 'Incomplete', dateCreated: '2020-01-01T09:29:52.4965653Z',
};
const order3 = {
  id: 3, status: 'Incomplete', dateCreated: '2020-01-03T09:29:52.4965653Z',
};
const order4 = {
  id: 4, status: 'Incomplete', dateCreated: '2020-01-02T09:29:52.4965653Z',
};
const order5 = {
  id: 5, status: 'Complete', dateCreated: '2020-01-06T09:29:52.4965653Z', dateCompleted: '2020-02-06T09:29:52.4965653Z',
};

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

  it('should return the orders grouped by status and sorted by descending dateCreated or dateCompleted', async () => {
    getData.mockResolvedValueOnce([order1, order2, order3, order4, order5]);

    const { completedOrders, incompletedOrders } = await getOrders({ orgId, accessToken });
    expect(completedOrders).toEqual([order5, order1]);
    expect(incompletedOrders).toEqual([order3, order4, order2]);
  });
});

describe('groupOrdersByStatus', () => {
  it('should group complete and incomplete orders', () => {
    const orders = [order1, order2, order3, order4, order5];

    const { completedOrders, incompletedOrders } = groupOrdersByStatus(orders);

    expect(completedOrders).toEqual([order1, order5]);
    expect(incompletedOrders).toEqual([order2, order3, order4]);
  });
});

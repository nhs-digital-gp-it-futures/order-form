import { getDashboardContext } from './controller';
import * as contextCreator from './contextCreator';
import { logger } from '../../logger';
import { orderApiUrl } from '../../config';
import mockOrdersData from '../../test-utils/mockData/mockOrders.json';
import { getOrders } from '../../helpers/api/ordapi/getOrders';

jest.mock('buying-catalogue-library');
jest.mock('../../helpers/api/ordapi/getOrders');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('dashboard controller', () => {
  describe('getDashboardContext', () => {
    afterEach(() => {
      getOrders.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('should call getOrders once with the correct params', async () => {
      getOrders.mockResolvedValueOnce(mockOrdersData);

      await getDashboardContext({ orgId: 'org-id', orgName: 'org1', accessToken: 'access_token' });
      expect(getOrders.mock.calls.length).toEqual(1);
      expect(getOrders).toHaveBeenCalledWith({
        orgId: 'org-id',
        accessToken: 'access_token',
      });
    });

    it('should call getContext with the correct params when orders data is returned by getData', async () => {
      getOrders.mockResolvedValueOnce(mockOrdersData);
      contextCreator.getContext.mockResolvedValueOnce();

      await getDashboardContext({ orgId: 'org-id', orgName: 'org1', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orgName: 'org1', ordersData: mockOrdersData });
    });
  });
});

import { getData } from 'buying-catalogue-library';
import { getDashboardContext } from './controller';
import * as contextCreator from './contextCreator';
import { logger } from '../../logger';
import { orderApiUrl } from '../../config';
import mockOrdersData from '../../test-utils/mockData/mockOrders.json';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('dashboard controller', () => {
  describe('getDashboardContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce(mockOrdersData);

      await getDashboardContext({ orgId: 'org-id', orgName: 'org1', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/organisation/org-id/orders`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should call getContext with the correct params when orders data is returned by getData', async () => {
      getData
        .mockResolvedValueOnce(mockOrdersData);
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getDashboardContext({ orgId: 'org-id', orgName: 'org1', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orgName: 'org1', ordersData: mockOrdersData });
    });

    it('should call getContext with the correct params when no orders data is returned by getData', async () => {
      getData
        .mockResolvedValueOnce();
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getDashboardContext({ orgId: 'org-id', orgName: 'org1', accessToken: 'access_token' });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orgName: 'org1', ordersData: [] });
    });
  });
});

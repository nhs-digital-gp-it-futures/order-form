import { getDashboardContext } from './controller';
import * as contextCreator from './contextCreator';
import { getOrders } from '../../helpers/api/ordapi/getOrders';

jest.mock('../../helpers/api/ordapi/getOrders');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../select/controller');

describe('dashboard controller', () => {
  describe('getDashboardContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrders once with the correct params', async () => {
      getOrders.mockResolvedValueOnce({ completedOrders: [], incompletedOrders: [] });

      await getDashboardContext({ orgId: 'org-id', orgName: 'org1', accessToken: 'access_token' });
      expect(getOrders.mock.calls.length).toEqual(1);
      expect(getOrders).toHaveBeenCalledWith({
        orgId: 'org-id',
        accessToken: 'access_token',
      });
    });

    it('should call getContext with the correct params when orders data is returned by getData', async () => {
      getOrders.mockResolvedValueOnce({ completedOrders: [], incompletedOrders: [] });
      contextCreator.getContext.mockResolvedValueOnce();

      await getDashboardContext({ orgId: 'org-id', orgName: 'org1', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orgName: 'org1', completedOrders: [], incompletedOrders: [] });
    });
  });
});

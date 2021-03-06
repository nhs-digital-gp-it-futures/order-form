import { getDashboardContext } from './controller';
import * as contextCreator from './contextCreator';
import { getOrders } from '../../helpers/api/ordapi/getOrders';
import { getIsUserProxy } from '../../helpers/controllers/getIsUserProxy';

jest.mock('../../helpers/api/ordapi/getOrders');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../select/controller');
jest.mock('../../helpers/controllers/getIsUserProxy');
jest.mock('../../helpers/controllers/odsCodeLookup.js');

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
      getIsUserProxy.mockResolvedValueOnce(true);
      contextCreator.getContext.mockResolvedValueOnce();

      await getDashboardContext({
        orgId: 'org-id',
        orgName: 'org1',
        accessToken: 'access_token',
        odsCode: 'odsCode',
        mainOrgOdsCode: 'mainOdsCode',
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orgName: 'org1',
        completedOrders: [],
        incompletedOrders: [],
        userIsProxy: true,
        odsCode: 'odsCode',
        mainOrgOdsCode: 'mainOdsCode',
      });
    });
  });
});

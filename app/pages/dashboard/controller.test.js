import { getData } from 'buying-catalogue-library';
import { getDashboardContext } from './controller';
import * as contextCreator from './contextCreator';
import { logger } from '../../logger';
import { orderApiUrl } from '../../config';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const mockOrdersData = [
  {
    orderId: 'C0000014-01',
    orderDescription: 'Some Order',
    lastUpdatedBy: 'Alice Smith',
    lastUpdated: '2020-05-06T11:29:52.4965647Z',
    dateCreated: '2020-01-06T09:29:52.4965653Z',
    status: 'Unsubmitted',
  },
  {
    orderId: 'C000012-01',
    orderDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean m',
    lastUpdatedBy: 'Bobbybobbybobby Smithsmith-Smithsmith-Smithsmith',
    lastUpdated: '2020-12-09T09:29:52.49657Z',
    dateCreated: '2020-10-09T09:29:52.4965701Z',
    status: 'Submitted',
  },
];

describe('dashboard controller', () => {
  describe('getDashboardContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce(mockOrdersData);

      await getDashboardContext({ organisationId: 1, accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should call getContext with the correct params when orders data is returned by getData', async () => {
      getData
        .mockResolvedValueOnce(mockOrdersData);
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getDashboardContext({ orgId: 'org1', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orgId: 'org1', ordersData: mockOrdersData });
    });

    it('should call getContext with the correct params when no orders data is returned by getData', async () => {
      getData
        .mockResolvedValueOnce();
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getDashboardContext({ orgId: 'org1', accessToken: 'access_token' });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orgId: 'org1', ordersData: [] });
    });
  });
});

import { getData } from 'buying-catalogue-library';
import { getCallOffOrderingPartyContext } from './controller';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const mockOrderingPartyData = {
  name: 'Hampshire CC',
  odsCode: '432432',
  address: {
    line1: 'line 1',
    line2: 'line 2',
    line3: 'line 3',
    line4: 'line 4',
    line5: 'line 5',
    town: 'townville',
    county: 'countyshire',
    postcode: 'HA3 PSH',
    country: 'UK',
  },
};

describe('Call-off-ordering-party controller', () => {
  describe('getCallOffOrderingPartyContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: { description: 'a lovely description' } });

      await getCallOffOrderingPartyContext({ orderId: 'order-id', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/call-off-ordering-party`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should call getContext with the correct params when data returned from getData', async () => {
      getData
        .mockResolvedValueOnce(mockOrderingPartyData);
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getCallOffOrderingPartyContext({ orderId: 'order-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id', data: mockOrderingPartyData });
    });
  });
});

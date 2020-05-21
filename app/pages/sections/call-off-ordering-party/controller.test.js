import { getData } from 'buying-catalogue-library';
import { getCallOffOrderingPartyContext } from './controller';
import { logger } from '../../../logger';
import { orderApiUrl, organisationApiUrl } from '../../../config';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const mockOrderingPartyData = {
  name: 'Hampshire CC',
  odsCode: 'AB3',
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

const mockOrgData = {
  organisationId: 'b7ee5261-43e7-4589-907b-5eef5e98c085',
  name: 'Cheshire and Merseyside Commissioning Hub',
  odsCode: 'AB2',
  primaryRoleId: 'RO98',
  address: {
    line1: 'C/O NHS ENGLAND, 1W09, 1ST FLOOR',
    line2: 'QUARRY HOUSE',
    line3: 'QUARRY HILL',
    line4: null,
    town: 'LEEDS',
    county: 'WEST YORKSHIRE',
    postcode: 'LS2 7UE',
    country: 'ENGLAND',
  },
  catalogueAgreementSigned: false,
};

describe('Call-off-ordering-party controller', () => {
  describe('getCallOffOrderingPartyContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });
    describe('when call-off-ordering-party is not completed yet', () => {
      it('should call getData twice with the correct params', async () => {
        getData
          .mockRejectedValueOnce({})
          .mockResolvedValueOnce(mockOrgData);

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });
        expect(getData.mock.calls.length).toEqual(2);
        expect(getData).toHaveBeenNthCalledWith(1, {
          endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/ordering-party`,
          accessToken: 'access_token',
          logger,
        });
        expect(getData).toHaveBeenNthCalledWith(2, {
          endpoint: `${organisationApiUrl}/api/v1/Organisations/org-id`,
          accessToken: 'access_token',
          logger,
        });
      });

      it('should call getContext with the correct params when data returned from organisations API', async () => {
        getData
          .mockRejectedValueOnce({})
          .mockResolvedValueOnce(mockOrgData);
        contextCreator.getContext
          .mockResolvedValueOnce();

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ data: mockOrgData, orderId: 'order-id' });
      });
    });

    describe('when call-off-ordering-party is already completed', () => {
      it('should call getData once with the correct params', async () => {
        getData
          .mockResolvedValueOnce(mockOrderingPartyData);

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });
        expect(getData.mock.calls.length).toEqual(1);
        expect(getData).toHaveBeenCalledWith({
          endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/ordering-party`,
          accessToken: 'access_token',
          logger,
        });
      });

      it('should call getContext with the correct params when data returned from ordering API', async () => {
        getData
          .mockResolvedValueOnce(mockOrderingPartyData);

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ data: mockOrderingPartyData, orderId: 'order-id' });
      });
    });
  });
});

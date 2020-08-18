import { getData } from 'buying-catalogue-library';
import { getCallOffOrderingPartyContext } from './controller';
import { logger } from '../../../logger';
import { organisationApiUrl } from '../../../config';
import * as contextCreator from './contextCreator';
import { getCallOffOrderingParty } from '../../../helpers/api/ordapi/getCallOffOrderingParty';

jest.mock('buying-catalogue-library');
jest.mock('../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../helpers/api/ordapi/getCallOffOrderingParty');

const mockPrimaryContact = {
  firstName: 'first name',
  lastName: 'last name',
  telephoneNumber: '07777777777',
  emailAddress: 'email@address.com',
};

const mockOrganisation = {
  name: 'Hampshire CC',
  odsCode: 'AB3',
  address: {
    line1: 'line 1',
    line2: 'line 2',
    line3: 'line 3',
    line4: null,
    line5: 'line 5',
    town: 'townville',
    county: 'countyshire',
    postcode: 'HA3 PSH',
    country: 'UK',
  },
};

const mockCompleteData = {
  ...mockOrganisation, primaryContact: { ...mockPrimaryContact },
};

const mockDataFromOapi = {
  organisationId: 'b7ee5261-43e7-4589-907b-5eef5e98c085',
  primaryRoleId: 'RO98',
  catalogueAgreementSigned: false,
  ...mockOrganisation,
};

describe('ordering-party controller', () => {
  describe('getCallOffOrderingPartyContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('when ordering-party is not completed yet', () => {
      it('should initially call ordapi to get callOffOrderingParty and then getData with the correct params', async () => {
        getCallOffOrderingParty.mockResolvedValueOnce({});

        getData
          .mockResolvedValueOnce(mockDataFromOapi);

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });
        expect(getCallOffOrderingParty.mock.calls.length).toEqual(1);
        expect(getCallOffOrderingParty).toHaveBeenCalledWith({
          orderId: 'order-id',
          accessToken: 'access_token',
        });
        expect(getData.mock.calls.length).toEqual(1);
        expect(getData).toHaveBeenCalledWith({
          endpoint: `${organisationApiUrl}/api/v1/Organisations/org-id`,
          accessToken: 'access_token',
          logger,
        });
      });

      it('should call getContext with the correct params when organisation data returned from organisations API', async () => {
        getCallOffOrderingParty.mockResolvedValueOnce({});
        getData.mockResolvedValueOnce(mockDataFromOapi);
        contextCreator.getContext
          .mockResolvedValueOnce();

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ orgData: mockDataFromOapi, orderId: 'order-id' });
      });

      it('should call getContext with the correct params when primary contact data returned from organisations API', async () => {
        getCallOffOrderingParty.mockResolvedValueOnce({});
        getData.mockResolvedValueOnce(mockOrganisation);
        contextCreator.getContext
          .mockResolvedValueOnce();

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ orgData: mockOrganisation, orderId: 'order-id' });
      });
    });

    describe('when ordering-party is already completed', () => {
      it('should call getCallOffOrderingParty with the correct params', async () => {
        getCallOffOrderingParty.mockResolvedValueOnce(mockCompleteData);

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });
        expect(getCallOffOrderingParty.mock.calls.length).toEqual(1);
        expect(getCallOffOrderingParty).toHaveBeenCalledWith({
          orderId: 'order-id',
          accessToken: 'access_token',
        });
      });

      it('should call getContext with the correct params when data returned from ordering API', async () => {
        getCallOffOrderingParty.mockResolvedValueOnce(mockCompleteData);

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ orgData: mockCompleteData, orderId: 'order-id' });
      });
    });
  });
});

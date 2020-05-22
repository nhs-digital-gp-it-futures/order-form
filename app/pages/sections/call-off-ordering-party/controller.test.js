import { getData, putData } from 'buying-catalogue-library';
import { getCallOffOrderingPartyContext, putCallOffOrderingParty } from './controller';
import { logger } from '../../../logger';
import { orderApiUrl, organisationApiUrl } from '../../../config';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

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
  organisation: { ...mockOrganisation },
  primaryContact: { ...mockPrimaryContact },
};

const mockDataFromOapi = {
  organisationId: 'b7ee5261-43e7-4589-907b-5eef5e98c085',
  primaryRoleId: 'RO98',
  catalogueAgreementSigned: false,
  ...mockOrganisation,
};

const mockFormData = {
  name: mockOrganisation.name,
  odsCode: mockOrganisation.odsCode,
  ...mockOrganisation.address,
  ...mockPrimaryContact,
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
          .mockResolvedValueOnce(mockDataFromOapi);

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

      it('should call getContext with the correct params when organisation data returned from organisations API', async () => {
        getData
          .mockRejectedValueOnce({})
          .mockResolvedValueOnce({ organisation: mockDataFromOapi });
        contextCreator.getContext
          .mockResolvedValueOnce();

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ orgData: mockDataFromOapi, orderId: 'order-id' });
      });

      it('should call getContext with the correct params when primary contact data returned from organisations API', async () => {
        getData
          .mockRejectedValueOnce({})
          .mockResolvedValueOnce({ primaryContact: mockPrimaryContact });
        contextCreator.getContext
          .mockResolvedValueOnce();

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ contactData: mockPrimaryContact, orderId: 'order-id' });
      });
    });

    describe('when call-off-ordering-party is already completed', () => {
      it('should call getData once with the correct params', async () => {
        getData
          .mockResolvedValueOnce(mockCompleteData);

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
          .mockResolvedValueOnce(mockCompleteData);

        await getCallOffOrderingPartyContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ orgData: mockCompleteData.organisation, contactData: mockCompleteData.primaryContact, orderId: 'order-id' });
      });
    });
  });

  describe('putCallOffOrderingParty', () => {
    afterEach(() => {
      putData.mockReset();
    });

    it('should call putData once with the correct params', async () => {
      putData
        .mockResolvedValueOnce({});

      await putCallOffOrderingParty({
        orgId: 'org-id', orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
      });
      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/ordering-party`,
        body: mockCompleteData,
        organisationId: 'org-id',
        accessToken: 'access_token',
        logger,
      });
    });

    it('should trim whitespace from the data', async () => {
      const mockData = {
        ...mockFormData,
        line2: '   line 2  ',
        line3: '  line 3',
        line4: null,
        line5: 'line 5  ',
        town: ' townville  ',
      };

      putData
        .mockResolvedValueOnce({});

      await putCallOffOrderingParty({
        orgId: 'org-id', orderId: 'order-id', data: mockData, accessToken: 'access_token',
      });
      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/ordering-party`,
        body: mockCompleteData,
        organisationId: 'org-id',
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return succes: true if put is successful', async () => {
      putData
        .mockResolvedValueOnce({});

      const response = await putCallOffOrderingParty({
        orgId: 'org-id', orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
      });
      expect(response).toEqual({ success: true });
    });

    it('should return error.respose.data if api request is unsuccessful with 400', async () => {
      const responseData = { errors: [{}] };
      putData
        .mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      const response = await putCallOffOrderingParty({
        orgId: 'org-id', orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
      });

      expect(response).toEqual(responseData);
    });

    it('should throw an error if api request is unsuccessful with non 400', async () => {
      putData
        .mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

      try {
        await putCallOffOrderingParty({
          orgId: 'org-id', orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
        });
      } catch (err) {
        expect(err).toEqual(new Error());
      }
    });
  });
});

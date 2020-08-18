import { putData } from 'buying-catalogue-library';
import { putOrderingParty } from './putOrderingParty';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

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

const mockPrimaryContact = {
  firstName: 'first name',
  lastName: 'last name',
  telephoneNumber: '07777777777',
  emailAddress: 'email@address.com',
};

const mockCompleteData = {
  ...mockOrganisation, primaryContact: { ...mockPrimaryContact },
};

const mockFormData = {
  name: mockOrganisation.name,
  odsCode: mockOrganisation.odsCode,
  ...mockOrganisation.address,
  ...mockPrimaryContact,
};

describe('putOrderingParty', () => {
  afterEach(() => {
    putData.mockReset();
  });

  it('should call putData once with the correct params', async () => {
    putData
      .mockResolvedValueOnce({});

    await putOrderingParty({
      orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
    });
    expect(putData.mock.calls.length).toEqual(1);
    expect(putData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/ordering-party`,
      body: mockCompleteData,
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

    await putOrderingParty({
      orderId: 'order-id', data: mockData, accessToken: 'access_token',
    });
    expect(putData.mock.calls.length).toEqual(1);
    expect(putData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/ordering-party`,
      body: mockCompleteData,
      accessToken: 'access_token',
      logger,
    });
  });

  it('should return success: true if put is successful', async () => {
    putData
      .mockResolvedValueOnce({});

    const response = await putOrderingParty({
      orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
    });
    expect(response).toEqual({ success: true });
  });

  it('should return error.respose.data if api request is unsuccessful with 400', async () => {
    const responseData = { errors: [{}] };
    putData
      .mockRejectedValueOnce({ response: { status: 400, data: responseData } });

    const response = await putOrderingParty({
      orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
    });

    expect(response).toEqual(responseData);
  });

  it('should throw an error if api request is unsuccessful with non 400', async () => {
    putData
      .mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

    try {
      await putOrderingParty({
        orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
      });
    } catch (err) {
      expect(err).toEqual(new Error());
    }
  });
});

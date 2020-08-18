import { putData } from 'buying-catalogue-library';
import { putSupplier } from './putSupplier';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('putSupplier', () => {
  afterEach(() => {
    putData.mockReset();
  });

  const mockFormData = {
    supplierId: 'supp-1',
    name: 'SupplierOne',
    line1: 'line 1',
    line2: '   line 2  ',
    line3: '  line 3',
    line4: null,
    line5: 'line 5  ',
    town: ' townville  ',
    postcode: 'HA3 PSH',
    firstName: 'Bob',
  };

  const formattedPutData = {
    supplierId: 'supp-1',
    name: 'SupplierOne',
    address: {
      line1: 'line 1',
      line2: 'line 2',
      line3: 'line 3',
      line5: 'line 5',
      town: 'townville',
      postcode: 'HA3 PSH',
    },
    primaryContact: {
      firstName: 'Bob',
    },
  };

  const accessToken = 'access_token';
  const orderId = 'order-id';

  it('should format form data and call putData once with the correct params', async () => {
    putData.mockResolvedValueOnce({});

    await putSupplier({
      orderId, data: mockFormData, accessToken,
    });

    expect(putData.mock.calls.length).toEqual(1);
    expect(putData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/supplier`,
      body: formattedPutData,
      accessToken,
      logger,
    });
  });

  it('should return success: true if put is successful', async () => {
    putData.mockResolvedValueOnce({});

    const response = await putSupplier({
      orderId, data: mockFormData, accessToken,
    });
    expect(response).toEqual({ success: true });
  });

  it('should return error.respose.data if api request is unsuccessful with 400', async () => {
    const responseData = { errors: [{}] };
    putData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

    const response = await putSupplier({
      orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
    });

    expect(response).toEqual(responseData);
  });

  it('should throw an error if api request is unsuccessful with non 400', async () => {
    putData.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

    try {
      await putSupplier({
        orderId: 'order-id', data: mockFormData, accessToken: 'access_token',
      });
    } catch (err) {
      expect(err).toEqual(new Error());
    }
  });
});

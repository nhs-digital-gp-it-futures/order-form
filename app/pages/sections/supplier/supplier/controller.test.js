import { getData, putData } from 'buying-catalogue-library';
import * as contextCreator from './contextCreator';
import { logger } from '../../../../logger';
import { solutionsApiUrl, orderApiUrl } from '../../../../config';
import { getSupplierPageContext, putSupplier } from './controller';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const accessToken = 'access_token';
const orderId = 'order-id';

describe('supplier controller', () => {
  describe('getSupplierPageContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    describe('when ordapi has supplier data', () => {
      it('should call getData with the correct params', async () => {
        getData.mockResolvedValueOnce({ name: 'a lovely name' });

        await getSupplierPageContext({ orderId, accessToken });
        expect(getData.mock.calls.length).toEqual(1);
        expect(getData).toHaveBeenCalledWith({
          endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/supplier`,
          accessToken,
          logger,
        });
      });

      it('should call getContext with the correct params', async () => {
        getData.mockResolvedValueOnce({ name: 'a lovely name' });
        contextCreator.getContext.mockResolvedValueOnce({});

        await getSupplierPageContext({ orderId, accessToken });
        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, supplierData: { name: 'a lovely name' } });
      });
    });

    describe('when ordapi does not have supplier data and supplierId is provided', () => {
      it('should call getData with the correct params', async () => {
        getData
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({});

        await getSupplierPageContext({ orderId, supplierId: 'supp-id', accessToken });
        expect(getData.mock.calls.length).toEqual(2);
        expect(getData).toHaveBeenNthCalledWith(1, {
          endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/supplier`,
          accessToken,
          logger,
        });
        expect(getData).toHaveBeenNthCalledWith(2, {
          endpoint: `${solutionsApiUrl}/api/v1/suppliers/supp-id`,
          accessToken,
          logger,
        });
      });

      it('should call getContext with the correct params', async () => {
        getData
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({ name: 'supplier' });
        contextCreator.getContext.mockResolvedValueOnce({});

        await getSupplierPageContext({ orderId, supplierId: 'supplier-id', accessToken });
        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, supplierData: { name: 'supplier' } });
      });
    });

    describe('when ordapi does not have supplier data and supplierId not provided', () => {
      it('should call getData once with the correct params', async () => {
        getData.mockResolvedValueOnce({});
        try {
          await getSupplierPageContext({ orderId, accessToken });
        } catch (err) {
          expect(getData.mock.calls.length).toEqual(1);
          expect(getData).toHaveBeenCalledWith({
            endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/supplier`,
            accessToken,
            logger,
          });
        }
      });

      it('should not call getContext', async () => {
        getData.mockResolvedValueOnce({});
        try {
          await getSupplierPageContext({ orderId, accessToken });
        } catch (err) {
          expect(contextCreator.getContext.mock.calls.length).toEqual(0);
        }
      });

      it('should throw error', async () => {
        getData.mockResolvedValueOnce({});
        try {
          await getSupplierPageContext({ orderId, accessToken });
        } catch (err) {
          expect(err).toEqual(new Error());
        }
      });
    });
  });

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

    it('should return succes: true if put is successful', async () => {
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
});

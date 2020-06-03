import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';
import { checkOrdapiForSupplier } from './controller';

jest.mock('buying-catalogue-library');
jest.mock('../../../logger');

const accessToken = 'access_token';
const orderId = 'order-id';

describe('supplier base controller', () => {
  describe('checkOrdapiForSupplier', () => {
    afterEach(() => {
      getData.mockReset();
    });

    describe('checkOrdapiForSupplier', () => {
      it('should call getData with the correct params', async () => {
        getData.mockResolvedValueOnce({ name: 'a lovely name' });

        await checkOrdapiForSupplier({ orderId, accessToken });
        expect(getData.mock.calls.length).toEqual(1);
        expect(getData).toHaveBeenCalledWith({
          endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/supplier`,
          accessToken,
          logger,
        });
      });

      it('should return true if ORDAPI returns data', async () => {
        getData.mockResolvedValueOnce({ name: 'a lovely name' });

        const response = await checkOrdapiForSupplier({ orderId, accessToken });
        expect(response).toEqual(true);
      });

      it('should return false if ORDAPI returns no data', async () => {
        getData.mockResolvedValueOnce({});

        const response = await checkOrdapiForSupplier({ orderId, accessToken });
        expect(response).toEqual(false);
      });
    });
  });
});

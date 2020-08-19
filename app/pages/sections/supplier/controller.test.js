import { checkOrdapiForSupplier } from './controller';
import { getSupplier } from '../../../helpers/api/ordapi/getSupplier';

jest.mock('../../../logger');
jest.mock('../../../helpers/api/ordapi/getSupplier');

const accessToken = 'access_token';
const orderId = 'order-id';

describe('supplier base controller', () => {
  describe('checkOrdapiForSupplier', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('checkOrdapiForSupplier', () => {
      it('should call getData with the correct params', async () => {
        getSupplier.mockResolvedValueOnce({ name: 'a lovely name' });

        await checkOrdapiForSupplier({ orderId, accessToken });
        expect(getSupplier.mock.calls.length).toEqual(1);
        expect(getSupplier).toHaveBeenCalledWith({
          orderId: 'order-id',
          accessToken,
        });
      });

      it('should return true if ORDAPI returns data', async () => {
        getSupplier.mockResolvedValueOnce({ name: 'a lovely name' });

        const response = await checkOrdapiForSupplier({ orderId, accessToken });
        expect(response).toEqual(true);
      });

      it('should return false if ORDAPI returns no data', async () => {
        getSupplier.mockResolvedValueOnce({});

        const response = await checkOrdapiForSupplier({ orderId, accessToken });
        expect(response).toEqual(false);
      });
    });
  });
});

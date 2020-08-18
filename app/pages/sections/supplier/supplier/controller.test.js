import { getData } from 'buying-catalogue-library';
import * as contextCreator from './contextCreator';
import { getSupplierPageContext } from './controller';
import { getSupplier as getSupplierFromBapi } from '../../../../helpers/api/bapi/getSupplier';
import { getSupplier as getSupplierFromOrdapi } from '../../../../helpers/api/ordapi/getSupplier';

jest.mock('buying-catalogue-library');
jest.mock('../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../../helpers/api/bapi/getSupplier');
jest.mock('../../../../helpers/api/ordapi/getSupplier');

const accessToken = 'access_token';
const orderId = 'order-id';

describe('supplier controller', () => {
  describe('getSupplierPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('when ordapi has supplier data', () => {
      it('should call getData with the correct params when hasSavedData is true', async () => {
        getSupplierFromOrdapi.mockResolvedValueOnce({ name: 'a lovely name' });

        await getSupplierPageContext({ orderId, accessToken, hasSavedData: true });
        expect(getSupplierFromOrdapi.mock.calls.length).toEqual(1);
        expect(getSupplierFromOrdapi).toHaveBeenCalledWith({
          orderId: 'order-id',
          accessToken,
        });
      });

      it('should call getContext with the correct params', async () => {
        getSupplierFromOrdapi.mockResolvedValueOnce({ name: 'a lovely name' });
        contextCreator.getContext.mockResolvedValueOnce({});

        await getSupplierPageContext({ orderId, accessToken, hasSavedData: true });
        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, supplierData: { name: 'a lovely name' }, hasSavedData: true });
      });
    });

    describe('when ordapi does not have supplier data and supplierId is provided', () => {
      it('should call getData with the correct params', async () => {
        getSupplierFromBapi.mockResolvedValueOnce({});

        await getSupplierPageContext({
          orderId, supplierId: 'supp-id', accessToken, hasSavedData: false,
        });
        expect(getSupplierFromBapi.mock.calls.length).toEqual(1);
        expect(getSupplierFromBapi).toHaveBeenCalledWith({
          supplierId: 'supp-id',
          accessToken,
        });
      });

      it('should call getContext with the correct params', async () => {
        getSupplierFromOrdapi.mockResolvedValueOnce({ name: 'supplier' });
        contextCreator.getContext.mockResolvedValueOnce({});

        await getSupplierPageContext({
          orderId, supplierId: 'supplier-id', accessToken, hasSavedData: true,
        });
        expect(contextCreator.getContext.mock.calls.length).toEqual(1);
        expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, supplierData: { name: 'supplier' }, hasSavedData: true });
      });
    });

    describe('when ordapi does not have supplier data and supplierId not provided', () => {
      it('should not call getData', async () => {
        try {
          await getSupplierPageContext({ orderId, accessToken, hasSavedData: false });
        } catch (err) {
          expect(getData.mock.calls.length).toEqual(0);
        }
      });

      it('should not call getContext', async () => {
        try {
          await getSupplierPageContext({ orderId, accessToken, hasSavedData: false });
        } catch (err) {
          expect(contextCreator.getContext.mock.calls.length).toEqual(0);
        }
      });

      it('should throw error', async () => {
        try {
          await getSupplierPageContext({ orderId, accessToken, hasSavedData: false });
        } catch (err) {
          expect(err).toEqual(new Error());
        }
      });
    });
  });
});

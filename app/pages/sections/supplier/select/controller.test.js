import { getSupplierSelectPageContext, validateSupplierSelectForm } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('supplier select controller', () => {
  describe('getSupplierSelectPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getSupplierSelectPageContext({ orderId: 'order-1', selectedSupplier: 'supp-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1', selectedSupplier: 'supp-1' });
    });
  });

  describe('validateSupplierSelectForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          selectSupplier: 'some supplier name',
        };

        const response = validateSupplierSelectForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const expectedValidationErrors = [
        {
          field: 'selectSupplier',
          id: 'SelectSupplierRequired',
        },
      ];

      it('should return an array of one validation error and success as false', () => {
        const data = {
          selectSupplier: '',
        };

        const response = validateSupplierSelectForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if supplierName is undefined', () => {
        const data = {};

        const response = validateSupplierSelectForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });
});

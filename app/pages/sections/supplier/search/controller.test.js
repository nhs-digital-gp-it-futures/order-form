import * as contextCreator from './contextCreator';
import { getSupplierSearchPageContext, validateSupplierSearchForm } from './controller';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('supplier search controller', () => {
  describe('getSupplierSearchPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getSupplierSearchPageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });

  describe('validateSupplierSearchForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          supplierName: 'some supplier name',
        };

        const response = validateSupplierSearchForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const expectedValidationErrors = [
        {
          field: 'supplierName',
          id: 'SupplierNameRequired',
        },
      ];

      it('should return an array of one validation error and success as false', () => {
        const data = {
          supplierName: '',
        };

        const response = validateSupplierSearchForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if supplierName just contains blank spaces', () => {
        const data = {
          supplierName: '  ',
        };

        const response = validateSupplierSearchForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if supplierName is undefined', () => {
        const data = {};

        const response = validateSupplierSearchForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });
});

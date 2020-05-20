import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../config';

jest.mock('buying-catalogue-library');


describe('decription contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the supplierName question', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.questions[0]).toEqual(manifest.questions[0]);
    });

    it('should return the searchButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.searchButtonText).toEqual(manifest.searchButtonText);
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [{
      field: 'supplierName',
      id: 'SupplierNameRequired',
    }];

    it('should construct errors array from the data provided', () => {
      formatErrors.mockReturnValue({});
      addErrorsAndDataToManifest.mockReturnValue({});
      formatAllErrors.mockReturnValue([
        { href: '#supplierName', text: 'Enter a supplier name or part of a supplier name' },
      ]);

      const context = getErrorContext({
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        data: { supplierName: '' },
      });

      expect(context.errors.length).toEqual(1);
      expect(context.errors[0].href).toEqual('#supplierName');
      expect(context.errors[0].text).toEqual('Enter a supplier name or part of a supplier name');
      formatErrors.mockRestore();
      addErrorsAndDataToManifest.mockRestore();
      formatAllErrors.mockRestore();
    });

    it('should call the helper functions', () => {
      formatErrors.mockReturnValue({});
      addErrorsAndDataToManifest.mockReturnValue({});
      formatAllErrors.mockReturnValue([
        { href: '#description', text: 'Description is required' },
      ]);

      getErrorContext({
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        data: { supplierName: '' },
      });

      expect(formatErrors.mock.calls.length).toEqual(1);
      expect(addErrorsAndDataToManifest.mock.calls.length).toEqual(1);
      expect(formatAllErrors.mock.calls.length).toEqual(1);

      formatErrors.mockRestore();
      addErrorsAndDataToManifest.mockRestore();
      formatAllErrors.mockRestore();
    });
  });
});

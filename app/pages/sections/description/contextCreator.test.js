import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../config';

jest.mock('buying-catalogue-library');

const mockValidationErrors = [{
  field: 'Description',
  id: 'OrderDescriptionRequired',
},
{
  field: 'Description',
  id: 'OrderDescriptionTooLong',
}];

describe('decription contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of the new order manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.title).toEqual(manifest.title);
      expect(context.description).toEqual(manifest.description);
      expect(context.questions).toEqual([{
        id: 'description',
        footerAdvice: '(Maximum number of characters 100)',
        rows: 3,
      }]);
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backlinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should add description to the question', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, description: 'a description of the order' });
      expect(context.questions[0].data).toEqual('a description of the order');
    });
  });

  describe('getErrorContext', () => {
    it('should construct errors array from the data provided', () => {
      formatErrors.mockReturnValue({});
      addErrorsAndDataToManifest.mockReturnValue({});
      formatAllErrors.mockReturnValue([
        { href: '#description', text: 'Description is too long' },
        { href: '#description', text: 'Description is required' },
      ]);

      const context = getErrorContext({
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        data: { description: 'a lovely description' },
      });

      expect(context.errors.length).toEqual(2);
      expect(context.errors[0].href).toEqual('#description');
      expect(context.errors[0].text).toEqual('Description is too long');
      expect(context.errors[1].href).toEqual('#description');
      expect(context.errors[1].text).toEqual('Description is required');
      formatErrors.mockRestore();
      addErrorsAndDataToManifest.mockRestore();
      formatAllErrors.mockRestore();
    });

    it('should call the helper functions', () => {
      formatErrors.mockReturnValue({});
      addErrorsAndDataToManifest.mockReturnValue({});
      formatAllErrors.mockReturnValue([
        { href: '#description', text: 'Description is too long' },
        { href: '#description', text: 'Description is required' },
      ]);

      getErrorContext({
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        data: { description: 'a lovely description' },
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

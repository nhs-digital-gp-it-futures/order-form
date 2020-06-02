import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../config';
import * as errorContext from '../getSectionErrorContext';

jest.mock('../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

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
    it('should return the contents of the manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.title).toEqual(manifest.title);
      expect(context.description).toEqual(manifest.description);
      expect(context.questions).toEqual([{
        id: 'description',
        footerAdvice: '(Maximum character length 100)',
        rows: 3,
      }]);
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should add description to the question', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, description: 'a description of the order' });
      expect(context.questions[0].data).toEqual('a description of the order');
    });
  });

  describe('getErrorContext', () => {
    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockResolvedValueOnce();
      const mockParams = {
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        data: { description: 'a lovely description' },
      };
      getErrorContext(mockParams);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
      expect(errorContext.getSectionErrorContext).toHaveBeenCalledWith({ ...mockParams, manifest });
    });
  });
});

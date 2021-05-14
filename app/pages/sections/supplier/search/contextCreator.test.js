import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../config';
import * as errorContext from '../../getSectionErrorContext';

jest.mock('../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

describe('supplier search contextCreator', () => {
  const orderId = 'order-1';
  const odsCode = 'odsCode';

  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({ orderId, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the supplierName question', () => {
      const context = getContext({ orderId });
      expect(context.questions[0]).toEqual(manifest.questions[0]);
    });

    it('should return the searchButtonText', () => {
      const context = getContext({ orderId });
      expect(context.searchButtonText).toEqual(manifest.searchButtonText);
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [{
      field: 'supplierName',
      id: 'SupplierNameRequired',
    }];

    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockResolvedValueOnce();
      const mockParams = {
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        data: { supplierName: '' },
      };
      getErrorContext(mockParams);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
      expect(errorContext.getSectionErrorContext).toHaveBeenCalledWith({ ...mockParams, manifest });
    });

    it('should construct title with orderid', () => {
      const context = getErrorContext({
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        data: { supplierName: '' },
      });
      expect(context.title).toEqual('Find supplier information for order-id');
    });
  });
});

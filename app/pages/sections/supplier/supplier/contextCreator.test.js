import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../config';
import * as errorContext from '../../getSectionErrorContext';

jest.mock('../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

describe('supplier contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/supplier/search/select`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the insetAdvice', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.insetAdvice).toEqual(manifest.insetAdvice);
    });

    it('should return the supplierData provided', () => {
      const supplierData = { name: 'some supp name' };
      const context = getContext({ orderId: 'order-1', supplierData });
      expect(context.supplierData).toEqual(supplierData);
    });

    it('should return the searchAgainLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.searchAgainLinkText).toEqual(manifest.searchAgainLinkText);
    });

    it('should construct the searchAgainLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.searchAgainLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/supplier/search`);
    });

    describe('questions with no data populated', () => {
      it('should return the firstName question', () => {
        const context = getContext({ orderId: 'order-1' });
        expect(context.questions[0]).toEqual(manifest.questions[0]);
      });

      it('should return the lastName question', () => {
        const context = getContext({ orderId: 'order-1' });
        expect(context.questions[1]).toEqual(manifest.questions[1]);
      });

      it('should return the emailAddress question', () => {
        const context = getContext({ orderId: 'order-1' });
        expect(context.questions[2]).toEqual(manifest.questions[2]);
      });

      it('should return the telephoneNumber question', () => {
        const context = getContext({ orderId: 'order-1' });
        expect(context.questions[3]).toEqual(manifest.questions[3]);
      });
    });

    describe('questions with data populated', () => {
      const supplierData = {
        primaryContact: {
          firstName: 'Bob',
          lastName: 'Smith',
          emailAddress: 'bob.smith@email.com',
          telephoneNumber: '01234567890',
        },
      };

      it('should return the data populated for firstName', () => {
        const context = getContext({ orderId: 'order-1', supplierData });
        expect(context.questions[0].data).toEqual(supplierData.primaryContact.firstName);
      });

      it('should return the data populated for lastName', () => {
        const context = getContext({ orderId: 'order-1', supplierData });
        expect(context.questions[1].data).toEqual(supplierData.primaryContact.lastName);
      });

      it('should return the data populated for emailAddress', () => {
        const context = getContext({ orderId: 'order-1', supplierData });
        expect(context.questions[2].data).toEqual(supplierData.primaryContact.emailAddress);
      });

      it('should return the data populated for telephoneNumber', () => {
        const context = getContext({ orderId: 'order-1', supplierData });
        expect(context.questions[3].data).toEqual(supplierData.primaryContact.telephoneNumber);
      });
    });

    it('should return the saveButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });
  });

  describe('getErrorContext', () => {
    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext.mockResolvedValueOnce();

      const mockParams = {
        orderId: 'order-id',
        validationErrors: [],
      };

      const updatedManifest = {
        ...manifest,
        title: 'Supplier information for order-id',
        backLinkHref: '/order/organisation/order-id/supplier/search/select',
        searchAgainLinkHref: '/order/organisation/order-id/supplier/search',
      };

      getErrorContext(mockParams);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
      expect(errorContext.getSectionErrorContext).toHaveBeenCalledWith({ ...mockParams, manifest: updatedManifest });
    });
  });
});

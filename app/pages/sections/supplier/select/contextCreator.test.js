import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../config';

jest.mock('buying-catalogue-library');


describe('supplier select contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/supplier/search`);
    });

    it('should return the title', () => {
      const context = getContext({});
      expect(context.title).toEqual(manifest.title);
    });

    it('should return the description', () => {
      const context = getContext({});
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the select supplier question', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectSupplier',
            mainAdvice: 'Select Supplier',
            options: [
              {
                value: 'supplier-1',
                text: 'Supplier 1',
              },
              {
                value: 'supplier-2',
                text: 'Supplier 2',
              },
            ],
          },
        ],
      };

      const suppliers = [
        {
          supplierId: 'supplier-1',
          name: 'Supplier 1',
        },
        {
          supplierId: 'supplier-2',
          name: 'Supplier 2',
        },
      ];

      const context = getContext({ suppliers });
      expect(context.questions).toEqual(expectedContext.questions);
    });


    it('should return the continueButtonText', () => {
      const context = getContext({});
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});

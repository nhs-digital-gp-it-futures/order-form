import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../../config';
import * as errorContext from '../../../../getSectionErrorContext';

jest.mock('../../../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

describe('additional-services select-recipient contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price`);
    });

    it('should return the title', () => {
      const itemName = 'Item One';
      const context = getContext({ itemName });
      expect(context.title).toEqual(`${manifest.title} ${itemName}`);
    });

    it('should return the description', () => {
      const context = getContext({});
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the select recipient question', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectRecipient',
            mainAdvice: 'Select Service Recipient (ODS code)',
            options: [
              {
                value: 'recipient-1',
                text: 'Recipient 1 (recipient-1)',
              },
              {
                value: 'recipient-2',
                text: 'Recipient 2 (recipient-2)',
              },
            ],
          },
        ],
      };

      const recipients = [
        {
          odsCode: 'recipient-1',
          name: 'Recipient 1',
        },
        {
          odsCode: 'recipient-2',
          name: 'Recipient 2',
        },
      ];

      const context = getContext({ recipients });
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({});
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [{
      field: 'selectRecipient',
      id: 'SelectRecipientRequired',
    }];

    const recipients = [
      { id: 'recipient-1', name: 'Recipient 1' },
      { id: 'recipient-2', name: 'Recipient 2' },
    ];

    const solutionName = 'Solution One';

    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockResolvedValueOnce();

      const params = {
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        solutionName,
        recipients,
      };

      getErrorContext(params);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
    });
  });
});

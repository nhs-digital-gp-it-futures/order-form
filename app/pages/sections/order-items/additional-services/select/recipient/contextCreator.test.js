import manifest from './manifest.json';
import { backLinkHref, getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../../config';
import * as errorContext from '../../../../getSectionErrorContext';

jest.mock('../../../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

const odsCode = '03F';

describe('additional-services select-recipient contextCreator', () => {
  describe('backLinkHref', () => {
    const orderId = 'order-Id-30';
    const orderItemId = 'order-item-id-85';
    const req = {
      headers: {},
    };

    it('should return referer if it ends additional service order item Id URL', () => {
      const referer = `https://some-nhs-site.com/${orderId}/additional-services/${orderItemId}`;
      req.headers.referer = referer;
      const actual = backLinkHref(req, {}, orderId);
      expect(actual).toEqual(referer);
    });

    it('should return price URL if referer does not end with additional service order item Id URL', () => {
      req.headers.referer = `https://some-nhs-site.com/${orderId}/additional-services/service/95`;
      const actual = backLinkHref(req, {}, orderId, odsCode);
      expect(actual).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price`);
    });
  });

  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref to price page if no additional services price input', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price`);
    });

    it('should construct the backLinkHref to additional service page if one additional services price input', () => {
      const additionalServicePrices = {
        prices: [
          { priceId: 42 },
        ],
      };
      const orderId = 'order-1';
      const context = getContext({ orderId, additionalServicePrices, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service`);
    });

    it('should construct the backLinkHref to price page if more than one additional services prices input', () => {
      const additionalServicePrices = {
        prices: [
          { priceId: 42 },
          { priceId: 5 },
          { priceId: 55 },
        ],
      };
      const orderId = 'order-1';
      const context = getContext({ orderId, additionalServicePrices, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price`);
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

    it('should return the select recipient question with a checked option if selectedAdditionalRecipientId passed in', () => {
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
                checked: true,
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

      const context = getContext({ recipients, selectedAdditionalRecipientId: 'recipient-2' });
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

    const itemName = 'Item One';

    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockResolvedValueOnce();

      const params = {
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        itemName,
        recipients,
      };

      getErrorContext(params);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
    });
  });
});

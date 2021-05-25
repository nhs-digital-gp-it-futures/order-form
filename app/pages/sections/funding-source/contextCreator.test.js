import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../config';
import * as errorContext from '../getSectionErrorContext';

jest.mock('../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

describe('funding source contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const odsCode = '03F';
      const context = getContext({ orderId, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the select recipient question', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectFundingSource',
            mainAdvice: 'Are you paying for this order in full using your GP IT Futures centrally held funding allocation?',
            options: [{
              value: true,
              text: 'Yes',
            },
            {
              value: false,
              text: 'No',
            }],
          },
        ],
      };

      const context = getContext({});
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return the select funding source question with a checked option if selectedAdditionalRecipientId passed in', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectFundingSource',
            mainAdvice: 'Are you paying for this order in full using your GP IT Futures centrally held funding allocation?',
            options: [{
              value: true,
              text: 'Yes',
              checked: true,
            },
            {
              value: false,
              text: 'No',
            }],
          },
        ],
      };

      const context = getContext({ fundingSource: true });
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return the saveButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [{
      field: 'selectFundingSource',
      id: 'SelectFundingSourceRequired',
    }];

    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockResolvedValueOnce();

      const params = {
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
      };

      getErrorContext(params);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
    });
  });
});

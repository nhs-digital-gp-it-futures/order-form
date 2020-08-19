import { getFundingSourceContext, validateFundingSourceForm } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('Funding Source controller', () => {
  describe('getFundingSourceContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getContext with the correct params for an order with an id', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getFundingSourceContext({ orderId: 'order-id' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id' });
    });
  });

  describe('validateFundingSourceForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          selectFundingSource: 'true',
        };

        const response = validateFundingSourceForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const expectedValidationErrors = [
        {
          field: 'selectFundingSource',
          id: 'SelectFundingSourceRequired',
        },
      ];

      it('should return an array of one validation error and success as false if empty string is passed in', () => {
        const data = {
          selectFundingSource: '',
        };

        const response = validateFundingSourceForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return an array of one validation error and success as false if whitespace only is passed in', () => {
        const data = {
          selectFundingSource: '   ',
        };

        const response = validateFundingSourceForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if selectFundingSource is undefined', () => {
        const data = {};

        const response = validateFundingSourceForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });
});

import * as contextCreator from './contextCreator';
import {
  getSolutionPricePageContext,
  validateSolutionPriceForm,
} from './controller';

jest.mock('../../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const orderId = 'order-id';

const solutionPrices = {
  id: 'sol-1',
  name: 'name',
  prices: [
    {
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'patient',
        description: 'per patient',
      },
      timeUnit: {
        name: 'year',
        description: 'per year',
      },
      price: 1.64,
    },
  ],
};

describe('select-price controller', () => {
  describe('getSolutionPricePageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getSolutionPricePageContext({ orderId, solutionPrices });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, solutionPrices });
    });
  });

  describe('validateSolutionForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          selectSolutionPrice: 'some-solution-id',
        };

        const response = validateSolutionPriceForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const expectedValidationErrors = [
        {
          field: 'selectSolutionPrice',
          id: 'SelectSolutionPriceRequired',
        },
      ];

      it('should return an array of one validation error and success as false if empty string is passed in', () => {
        const data = {
          selectSolution: '',
        };

        const response = validateSolutionPriceForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return an array of one validation error and success as false if whitespace only is passed in', () => {
        const data = {
          selectSolution: '   ',
        };

        const response = validateSolutionPriceForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if supplierName is undefined', () => {
        const data = {};

        const response = validateSolutionPriceForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });
});

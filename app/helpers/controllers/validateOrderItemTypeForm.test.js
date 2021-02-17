import { validateOrderItemTypeForm } from './validateOrderItemTypeForm';
import * as getSelectedPriceManifest from './manifestProvider';

jest.mock('./manifestProvider', () => ({
  getSelectedPriceManifest: jest.fn(),
}));

const selectedPrice = {
  priceId: 1,
  provisioningType: 'OnDemand',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.1,
};

const orderItemType = 'some-order-item-type';

describe('validateOrderItemForm', () => {
  describe('when there are no validation errors', () => {
    it('should return an empty array', () => {
      const selectedPriceManifest = { questions: {} };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
        selectEstimationPeriod: 'month',
      };

      const errors = validateOrderItemTypeForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([]);
    });
  });

  describe('when there are validation errors', () => {
    const quantityRequired = {
      field: 'Quantity',
      id: 'QuantityRequired',
    };
    const quantityMustBeANumber = {
      field: 'Quantity',
      id: 'QuantityMustBeANumber',
    };
    const quantityGreaterThanZero = {
      field: 'Quantity',
      id: 'QuantityGreaterThanZero',
    };
    const quantityInvalid = {
      field: 'Quantity',
      id: 'QuantityInvalid',
    };
    const quantityLessThanMax = {
      field: 'Quantity',
      id: 'QuantityLessThanMax',
    };
    const estimationPeriodRequired = {
      field: 'SelectEstimationPeriod',
      id: 'EstimationPeriodRequired',
    };

    it('should return an array of one validation error if an empty string for quantity is passed in', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '',
        selectEstimationPeriod: 'month',
      };

      const errors = validateOrderItemTypeForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityRequired]);
    });

    it('should return an array of one validation error if quantity is not a number', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: 'not a number',
        selectEstimationPeriod: 'month',
      };

      const errors = validateOrderItemTypeForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityMustBeANumber]);
    });

    it('should return an array of one validation error if quantity is invalid', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1.1',
        selectEstimationPeriod: 'month',
      };

      const errors = validateOrderItemTypeForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityInvalid]);
    });

    it('should return an array of one validation error if quantity is less than zero', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '-1',
        selectEstimationPeriod: 'month',
      };

      const errors = validateOrderItemTypeForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityGreaterThanZero]);
    });

    it('should return an array of one validation error if quantity value is too large', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '2147483647',
        selectEstimationPeriod: 'month',
      };

      const errors = validateOrderItemTypeForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityLessThanMax]);
    });

    it('should return an array of one validation error if an estimation period is not selected', () => {
      const selectedPriceManifest = { questions: { selectEstimationPeriod: 'test' } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
      };

      const errors = validateOrderItemTypeForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([estimationPeriodRequired]);
    });

    it('should return a validation error if all values are undefined', () => {
      const selectedPriceManifest = {
        questions: {
          quantity: 'test', selectEstimationPeriod: 'test',
        },
      };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {};

      const errors = validateOrderItemTypeForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual(
        [quantityRequired, estimationPeriodRequired],
      );
    });
  });
});

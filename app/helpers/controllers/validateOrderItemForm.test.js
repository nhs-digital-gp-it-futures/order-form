import { validateOrderItemForm } from './validateOrderItemForm';
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
      const selectedPriceManifest = { questions: {}, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
        price: '1',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

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
    const quantityInvalid = {
      field: 'Quantity',
      id: 'QuantityInvalid',
    };
    const quantityGreaterThanZero = {
      field: 'Quantity',
      id: 'QuantityGreaterThanZero',
    };
    const quantityLessThanMax = {
      field: 'Quantity',
      id: 'QuantityLessThanMax',
    };
    const estimationPeriodRequired = {
      field: 'SelectEstimationPeriod',
      id: 'EstimationPeriodRequired',
    };
    const priceRequired = {
      field: 'Price',
      id: 'PriceRequired',
    };
    const priceMustBeANumber = {
      field: 'Price',
      id: 'PriceMustBeANumber',
    };
    const priceMoreThan4dp = {
      field: 'Price',
      id: 'PriceMoreThan4dp',
    };
    const priceLessThanMax = {
      field: 'Price',
      id: 'PriceLessThanMax',
    };
    const deliveryDateRequired = {
      field: 'DeliveryDate',
      id: 'DeliveryDateRequired',
      part: ['day', 'month', 'year'],
    };

    it('should return an array of one validation error if an empty string for quantity is passed in', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '',
        price: '1.5',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityRequired]);
    });

    it('should return an array of one validation error if quantity is not a number', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: 'not a number',
        price: '1.5',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityMustBeANumber]);
    });

    it('should return an array of one validation error if quantity is invalid', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1.1',
        price: '1.5',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityInvalid]);
    });

    it('should return an array of one validation error if quantity is less than 0', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '-1',
        price: '1.5',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityGreaterThanZero]);
    });

    it('should return an array of one validation error if quantity value is too large', () => {
      const selectedPriceManifest = { questions: { quantity: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '2147483647',
        price: '1.5',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityLessThanMax]);
    });

    it('should return an array of one validation error if an estimation period is not selected', () => {
      const selectedPriceManifest = { questions: { selectEstimationPeriod: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
        price: '1.5',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([estimationPeriodRequired]);
    });

    it('should return an array of one validation error if empty string for price is passed in', () => {
      const selectedPriceManifest = { questions: {}, addPriceTable: { cellInfo: { price: { question: 'test' } } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
        price: '',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceRequired]);
    });

    it('should return an array of one validation error if price is not a number', () => {
      const selectedPriceManifest = { questions: {}, addPriceTable: { cellInfo: { price: { question: 'test' } } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
        price: 'not a number',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceMustBeANumber]);
    });

    it('should return an array of one validation error if price has more than 4dp', () => {
      const selectedPriceManifest = { questions: {}, addPriceTable: { cellInfo: { price: { question: 'test' } } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
        price: '1.12345',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceMoreThan4dp]);
    });

    it('should return an array of one validation error if price value is too big', () => {
      const selectedPriceManifest = { questions: {}, addPriceTable: { cellInfo: { price: { question: 'test' } } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
        price: '1000000000000001.000',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceLessThanMax]);
    });

    it('should return an array of one validation error  if deliveryDate is not valid', () => {
      const selectedPriceManifest = { questions: { deliveryDate: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
        price: '1.5',
        selectEstimationPeriod: 'month',
        'deliveryDate-day': '',
        'deliveryDate-month': '',
        'deliveryDate-year': '',
      };

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([deliveryDateRequired]);
    });

    it('should return a validation error if all values are undefined', () => {
      const selectedPriceManifest = {
        questions: {
          deliveryDate: 'test', quantity: 'test', selectEstimationPeriod: 'test',
        },
        addPriceTable: { cellInfo: { price: { question: 'test' } } },
      };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {};

      const errors = validateOrderItemForm({ orderItemType, data, selectedPrice });

      expect(errors).toEqual(
        [deliveryDateRequired, quantityRequired, estimationPeriodRequired, priceRequired],
      );
    });
  });
});

import { validateOrderItemFormBulk } from './validateOrderItemFormBulk';
import * as getSelectedPriceManifest from './manifestProvider';

jest.mock('./manifestProvider', () => ({
  getSelectedPriceManifest: jest.fn(),
}));

const selectedPrice = {
  priceId: 1,
  provisioningType: 'patient',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.1,
};

const deliveryDate = [{
  'deliveryDate-day': '09',
  'deliveryDate-month': '02',
  'deliveryDate-year': '2021',
}];

const orderItemType = 'some-order-item-type';

describe('validateOrderItemFormBulk', () => {
  describe('when there are no validation errors', () => {
    it('should return an empty array', () => {
      const selectedPriceManifest = { questions: {}, solutionTable: { cellInfo: { quantity: 'fakeSize', deliveryDate: 'fakeDate' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: '1',
        price: '1',
        'deliveryDate-day': '09',
        'deliveryDate-month': '02',
        'deliveryDate-year': '2021',
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([]);
    });
  });

  describe('when there are validation errors', () => {
    const selectedPriceManifest = {
      questions: { price: 'test' },
      solutionTable: {
        cellInfo: {
          quantity: { question: 'fakeSize' },
          deliveryDate: { question: 'fakeDate' },
        },
      },
    };
    const priceRequired = {
      field: 'Price',
      id: 'PriceRequired',
    };
    const priceMustBeANumber = {
      field: 'Price',
      id: 'PriceMustBeANumber',
    };
    const priceGreaterThanOrEqualToZero = {
      field: 'Price',
      id: 'PriceGreaterThanOrEqualToZero',
    };
    const priceMoreThan4dp = {
      field: 'Price',
      id: 'PriceMoreThan4dp',
    };
    const priceLessThanMax = {
      field: 'Price',
      id: 'PriceLessThanMax',
    };
    const priceGreaterThanListPrice = {
      field: 'Price',
      id: 'PriceGreaterThanListPrice',
    };
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
    const quantityLessThanMax = {
      field: 'Quantity',
      id: 'QuantityLessThanMax',
    };
    const deliveryDateRequired = {
      field: 'DeliveryDate',
      id: 'DeliveryDateRequired',
      part: ['day', 'month', 'year'],
    };

    it('should return an array of one validation error if empty string for price is passed in', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '',
        quantity: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceRequired]);
    });

    it('should return an array of one validation error if price is not a number', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: 'not a number',
        quantity: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceMustBeANumber]);
    });

    it('should return an array of one validation error if price is less than zero', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '-1',
        quantity: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceGreaterThanOrEqualToZero]);
    });

    it('should return an array of one validation error if price has more than 4dp', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '1.12345',
        quantity: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceMoreThan4dp]);
    });

    it('should return an array of one validation error if price value is too big', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '1000000000000001.000',
        quantity: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceLessThanMax]);
    });

    it('should return an array of one validation error if price is greater than the list price', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '0.11',
        quantity: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceGreaterThanListPrice]);
    });

    it('should return an array of one validation error if an empty string for price is passed in', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '',
        quantity: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceRequired]);
    });

    it('should return an array of one validation error if quantity is not a number', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '0.1',
        quantity: ['not a number'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityMustBeANumber]);
    });

    it('should return an array of one validation error if quantity is invalid', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '0.1',
        quantity: ['1.1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityInvalid]);
    });

    it('should return an array of one validation error if quantity value is too large', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '0.1',
        quantity: ['2147483647'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([quantityLessThanMax]);
    });

    it('should return an array of one validation error  if deliveryDate is not valid', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '0.1',
        quantity: ['1'],
        deliveryDate: [{
          'deliveryDate-day': '',
          'deliveryDate-month': '',
          'deliveryDate-year': '',
        }],
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([deliveryDateRequired]);
    });

    it('should return a validation error if all values are undefined', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        quantity: [''],
        deliveryDate: [{
          'deliveryDate-day': '',
          'deliveryDate-month': '',
          'deliveryDate-year': '',
        }],
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual(
        [priceRequired, quantityRequired, deliveryDateRequired],
      );
    });
  });
});

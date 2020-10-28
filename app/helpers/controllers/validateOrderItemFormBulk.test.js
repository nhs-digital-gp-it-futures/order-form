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
      const selectedPriceManifest = { questions: {}, solutionTable: { cellInfo: { practiceSize: 'fakeSize', deliveryDate: 'fakeDate' } } };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        practiceSize: '1',
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
          practiceSize: { question: 'fakeSize' },
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
    const priceMoreThan3dp = {
      field: 'Price',
      id: 'PriceMoreThan3dp',
    };
    const priceLessThanMax = {
      field: 'Price',
      id: 'PriceLessThanMax',
    };
    const practiceSizeRequired = {
      field: 'PracticeSize',
      id: 'PracticeSizeRequired',
    };
    const practiceSizeMustBeANumber = {
      field: 'PracticeSize',
      id: 'PracticeSizeMustBeANumber',
    };
    const practiceSizeInvalid = {
      field: 'PracticeSize',
      id: 'PracticeSizeInvalid',
    };
    const practiceSizeLessThanMax = {
      field: 'PracticeSize',
      id: 'PracticeSizeLessThanMax',
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
        practiceSize: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceRequired]);
    });

    it('should return an array of one validation error if price is not a number', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: 'not a number',
        practiceSize: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceMustBeANumber]);
    });

    it('should return an array of one validation error if price has more than 3dp', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '1.1234',
        practiceSize: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceMoreThan3dp]);
    });

    it('should return an array of one validation error if price value is too big', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '1000000000000001.000',
        practiceSize: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceLessThanMax]);
    });

    it('should return an array of one validation error if an empty string for price is passed in', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '',
        practiceSize: ['1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([priceRequired]);
    });

    it('should return an array of one validation error if practiceSize is not a number', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '1.5',
        practiceSize: ['not a number'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([practiceSizeMustBeANumber]);
    });

    it('should return an array of one validation error if practiceSize is invalid', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '1.5',
        practiceSize: ['1.1'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([practiceSizeInvalid]);
    });

    it('should return an array of one validation error if practiceSize value is too large', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '1.5',
        practiceSize: ['2147483647'],
        deliveryDate,
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual([practiceSizeLessThanMax]);
    });

    it('should return an array of one validation error  if deliveryDate is not valid', () => {
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
      const data = {
        price: '1.5',
        practiceSize: ['1'],
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
        practiceSize: [''],
        deliveryDate: [{
          'deliveryDate-day': '',
          'deliveryDate-month': '',
          'deliveryDate-year': '',
        }],
      };

      const errors = validateOrderItemFormBulk({ orderItemType, data, selectedPrice });

      expect(errors).toEqual(
        [priceRequired, practiceSizeRequired, deliveryDateRequired],
      );
    });
  });
});

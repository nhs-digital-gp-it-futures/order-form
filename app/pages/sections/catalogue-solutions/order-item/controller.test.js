import { getData, postData } from 'buying-catalogue-library';
import { solutionsApiUrl, organisationApiUrl, orderApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import {
  getRecipientName, getSelectedPrice, getOrderItemContext, validateOrderItemForm, postSolution,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const serviceRecipient = {
  name: 'Recipient 1',
  odsCode: 'ods1',
};
const solution = {
  id: 'solutionId1',
  name: 'Solution 1',
};

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

const detail = {
  _csrf: 'E4xB4klq-hLgMvQGHZxQhrHUhh6gSaLz5su8',
  'plannedDeliveryDate-day': '25',
  'plannedDeliveryDate-month': '12',
  'plannedDeliveryDate-year': '2020',
  price: '500.49',
  quantity: '1',
  selectEstimationPeriod: 'perMonth',
};

describe('catalogue-solutions order-item controller', () => {
  describe('getOrderItemContext', () => {
    it('should call getContext with the correct params', async () => {
      await getOrderItemContext({
        orderId: 'order-1',
        solutionName: 'solution-name',
        selectedRecipientId: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        selectedPriceId: 'some-price-id',
        selectedPrice,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        odsCode: 'fake-recipient-id',
        orderId: 'order-1',
        serviceRecipientName: 'Some service recipient 1',
        solutionName: 'solution-name',
        selectedPrice,
      });
    });
  });

  describe('getRecipient', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: {} });

      await getRecipientName({ selectedRecipientId: 'org-1', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${organisationApiUrl}/api/v1/ods/org-1`,
        accessToken: 'access_token',
        logger,
      });
    });
  });

  describe('getPrice', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: {} });

      await getSelectedPrice({ selectedPriceId: 'price-1', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/prices/price-1`,
        accessToken: 'access_token',
        logger,
      });
    });
  });

  describe('validateOrderItemForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          quantity: '1',
          price: '1',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const quantityRequired = {
        field: 'quantity',
        id: 'quantityRequired',
      };
      const numericalQuantity = {
        field: 'quantity',
        id: 'numericQuantityRequired',
      };
      const priceRequired = {
        field: 'price',
        id: 'priceRequired',
      };
      const numericalPrice = {
        field: 'price',
        id: 'numericPriceRequired',
      };

      it('should return an array of one validation error and success as false if empty string for quantity is passed in', () => {
        const data = {
          quantity: '',
          price: '1.5',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual([quantityRequired]);
      });

      it('should return an array of one validation error and success as false if quantity is not a number', () => {
        const data = {
          quantity: 'not a number',
          price: '1.5',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual([numericalQuantity]);
      });

      it('should return an array of one validation error and success as false if empty string for price is passed in', () => {
        const data = {
          quantity: '1',
          price: '',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual([priceRequired]);
      });

      it('should return an array of one validation error and success as false if empty string for price is passed in', () => {
        const data = {
          quantity: '1',
          price: 'not a number',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual([numericalPrice]);
      });

      it('should return a validation error if all values are undefined', () => {
        const data = {};

        const response = validateOrderItemForm({ data });

        expect(response.errors).toEqual(
          [quantityRequired, priceRequired],
        );
      });
    });
  });

  describe('postSolution', () => {
    afterEach(() => {
      postData.mockReset();
    });
    it('should post correctly formatted data', () => {
      postData.mockResolvedValueOnce({ data: { orderId: 'order1' } });

      postSolution({
        orderId: 'order1',
        accessToken: 'access_token',
        serviceRecipient,
        solution,
        selectedPrice,
        detail,
      });

      expect(postData.mock.calls.length).toEqual(1);
      expect(postData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order1/sections/catalogue-solutions`,
        body: {
          serviceRecipient,
          catalogueSolutionId: 'solutionId1',
          catalogueSolutionName: 'Solution 1',
          deliveryDate: '2020-12-25',
          quantity: 1,
          estimationPeriod: 'perMonth',
          provisioningType: 'OnDemand',
          type: 'flat',
          currencyCode: 'GBP',
          itemUnitModel: selectedPrice.itemUnit,
          price: 500.49,
        },
        accessToken: 'access_token',
        logger,
      });
    });
  });
});

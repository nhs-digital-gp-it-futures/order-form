import { getData } from 'buying-catalogue-library';
import { solutionsApiUrl, organisationApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import {
  getRecipientName, getSelectedPrice, getOrderItemContext, validateOrderItemForm,
} from './controller';
import * as contextCreator from './contextCreator';
import * as getSelectedPriceManifest from './manifestProvider';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

jest.mock('./commonManifest.json', () => ({ title: 'fake manifest' }));

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

describe('catalogue-solutions order-item controller', () => {
  describe('getOrderItemContext', () => {
    afterEach(() => {
      contextCreator.getContext.mockReset();
      getSelectedPriceManifest.getSelectedPriceManifest.mockReset();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      await getOrderItemContext({
        orderId: 'order-1',
        solutionName: 'solution-name',
        selectedRecipientId: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        selectedPriceId: 'some-price-id',
        selectedPrice,
      });

      expect(getSelectedPriceManifest.getSelectedPriceManifest.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.getSelectedPriceManifest).toHaveBeenCalledWith({
        provisioningType: selectedPrice.provisioningType,
        type: selectedPrice.type,
      });
    });

    it('should call getContext with the correct params', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      getSelectedPriceManifest
        .getSelectedPriceManifest
        .mockReturnValue(selectedPriceManifest);

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
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
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
          selectEstimationPeriod: 'perMonth',
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
      const estimationPeriodRequired = {
        field: 'selectEstimationPeriod',
        id: 'estimationPeriodRequired',
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
          selectEstimationPeriod: 'perMonth',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual([quantityRequired]);
      });

      it('should return an array of one validation error and success as false if quantity is not a number', () => {
        const data = {
          quantity: 'not a number',
          price: '1.5',
          selectEstimationPeriod: 'perMonth',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual([numericalQuantity]);
      });

      it('should return an array of one validation error and success as false if an estimation period is not selected', () => {
        const data = {
          quantity: '1',
          price: '1.5',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual([estimationPeriodRequired]);
      });

      it('should return an array of one validation error and success as false if empty string for price is passed in', () => {
        const data = {
          quantity: '1',
          price: '',
          selectEstimationPeriod: 'perMonth',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual([priceRequired]);
      });

      it('should return an array of one validation error and success as false if price is not a number', () => {
        const data = {
          quantity: '1',
          price: 'not a number',
          selectEstimationPeriod: 'perMonth',
        };

        const response = validateOrderItemForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual([numericalPrice]);
      });

      it('should return a validation error if all values are undefined', () => {
        const data = {};

        const response = validateOrderItemForm({ data });

        expect(response.errors).toEqual(
          [quantityRequired, estimationPeriodRequired, priceRequired],
        );
      });
    });
  });
});

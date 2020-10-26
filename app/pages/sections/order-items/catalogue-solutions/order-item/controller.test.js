import {
  getOrderItemContext, getOrderItemErrorContext,
} from './controller';
import * as contextCreator from './contextCreator';
import * as getSelectedPriceManifest from '../../../../../helpers/controllers/manifestProvider';

jest.mock('./contextCreator', () => ({ getContext: jest.fn(), getErrorContext: jest.fn() }));
jest.mock('./commonManifest.json', () => ({ title: 'fake manifest' }));

jest.mock('../../../../../helpers/controllers/manifestProvider', () => ({
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

const orderItemType = 'catalogue-solutions';

describe('catalogue-solutions order-item controller', () => {
  describe('getOrderItemContext', () => {
    afterEach(() => {
      contextCreator.getContext.mockReset();
      getSelectedPriceManifest.getSelectedPriceManifest.mockReset();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      await getOrderItemContext({
        orderId: 'order-1',
        orderItemType,
        solutionName: 'solution-name',
        selectedRecipientId: 'fake-recipient-id',
        selectedPriceId: 'some-price-id',
        selectedPrice,
      });

      expect(getSelectedPriceManifest.getSelectedPriceManifest.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.getSelectedPriceManifest).toHaveBeenCalledWith({
        orderItemType,
        provisioningType: selectedPrice.provisioningType,
        type: selectedPrice.type,
      });
    });

    it('should call getContext with the correct params when formData passed in', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      const formData = {
        deliveryDate: {
          day: 9,
          month: 2,
          year: 2021,
        },
        price: 0.1,
      };
      const recipients = [{}];

      await getOrderItemContext({
        orderId: 'order-1',
        solutionName: 'solution-name',
        selectedPriceId: 'some-price-id',
        orderItemId: 'order-item-id',
        selectedPrice,
        formData,
        recipients,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        orderId: 'order-1',
        solutionName: 'solution-name',
        orderItemId: 'order-item-id',
        formData,
        recipients,
      });
    });
  });

  describe('getOrderItemErrorContext', () => {
    afterEach(() => {
      contextCreator.getErrorContext.mockReset();
      getSelectedPriceManifest.getSelectedPriceManifest.mockReset();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      const params = {
        orderItemType,
        selectedPrice,
      };

      await getOrderItemErrorContext(params);

      expect(getSelectedPriceManifest.getSelectedPriceManifest.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.getSelectedPriceManifest).toHaveBeenCalledWith({
        orderItemType,
        provisioningType: selectedPrice.provisioningType,
        type: selectedPrice.type,
      });
    });

    it('should call getContext with the correct params when formData passed in', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      const formData = {
        deliveryDate: {
          day: 9,
          month: 2,
          year: 2021,
        },
        price: 0.1,
      };

      const params = {
        orderItemType,
        selectedPrice,
        formData,
      };

      await getOrderItemErrorContext(params);

      expect(contextCreator.getErrorContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getErrorContext).toHaveBeenCalledWith({
        ...params,
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        formData,
      });
    });
  });
});

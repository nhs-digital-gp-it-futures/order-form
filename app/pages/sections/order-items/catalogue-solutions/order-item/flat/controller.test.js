import {
  getProvisionTypeOrderContext, getProvisionTypeOrderErrorContext,
} from './controller';
import * as contextCreator from './contextCreator';
import * as getSelectedPriceManifest from '../../../../../../helpers/controllers/manifestProvider';

jest.mock('./contextCreator', () => ({ getContext: jest.fn(), getErrorContext: jest.fn() }));
jest.mock('./commonManifest.json', () => ({ title: 'fake manifest' }));
jest.mock('../../../../../../helpers/controllers/manifestProvider', () => ({
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

describe('catalogue-solutions order-item quantity and estimation page controller', () => {
  describe('getProvisionTypeOrderContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      const mockSelectedPrice = {
        provisioningType: 'Patient',
        type: 'flat',
      };
      await getProvisionTypeOrderContext({
        orderId: 'order-1',
        orderItemType,
        itemName: 'order item name',
        selectedPrice: mockSelectedPrice,
        formData: {
          quantity: 1,
          selectEstimationPeriod: 'month',
        },
      });

      expect(getSelectedPriceManifest.getSelectedPriceManifest.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.getSelectedPriceManifest).toHaveBeenCalledWith({
        orderItemType,
        provisioningType: mockSelectedPrice.provisioningType,
        type: mockSelectedPrice.type,
      });
    });

    it('should call getContext with the correct params when formData passed in', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      const mockSelectedPrice = {
        provisioningType: 'Patient',
        type: 'flat',
      };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      const formData = {
        deliveryDate: {
          day: 9,
          month: 2,
          year: 2021,
        },
        quantity: 1,
        selectEstimationPeriod: 'month',
      };

      await getProvisionTypeOrderContext({
        orderId: 'order-1',
        orderItemType,
        itemName: 'order item name',
        selectedPrice: mockSelectedPrice,
        formData,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        orderId: 'order-1',
        formData,
        itemName: 'order item name',
        selectedPrice: mockSelectedPrice,
      });
    });
  });

  describe('getProvisionTypeOrderErrorContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      const params = {
        orderItemType,
        selectedPrice,
      };

      await getProvisionTypeOrderErrorContext(params);

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
        quantity: 1,
        selectEstimationPeriod: 'month',
      };

      const params = {
        orderItemType,
        selectedPrice,
        formData,
      };

      await getProvisionTypeOrderErrorContext(params);

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

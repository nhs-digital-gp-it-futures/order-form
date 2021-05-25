import {
  getOrderItemContext,
  getOrderItemErrorPageContext,
  getBackLinkHref,
} from './controller';
import * as contextCreator from './contextCreator';
import * as getSelectedPriceManifest from '../../../../../helpers/controllers/manifestProvider';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
  getErrorContext: jest.fn(),
  backLinkHref: jest.fn(),
}));
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

const orderItemType = 'associated-services';
const orderId = 'order-id';
const odsCode = 'odsCode';
const req = { params: { orderId }, query: {} };
const associatedServicePrices = { prices: [] };

describe('associated-services order-item controller', () => {
  describe('getBackLinkHref', () => {
    it('should return result from backLinkHref', () => {
      const expected = 'http://some.link.com';
      contextCreator.backLinkHref.mockReturnValueOnce(expected);

      const actual = getBackLinkHref(req, associatedServicePrices, orderId, odsCode);

      expect(contextCreator.backLinkHref.mock.calls.length).toEqual(1);
      expect(contextCreator.backLinkHref).toHaveBeenCalledWith({
        req, associatedServicePrices, orderId, odsCode,
      });
      expect(actual).toEqual(expected);
    });
  });

  describe('getOrderItemContext', () => {
    afterEach(() => {
      contextCreator.getContext.mockReset();
      getSelectedPriceManifest.getSelectedPriceManifest.mockReset();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      await getOrderItemContext({
        orderId: 'order-1',
        orderItemType,
        itemName: 'item-name',
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

    it('should call getContext with the correct params', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      await getOrderItemContext({
        orderId: 'order-1',
        itemName: 'item-name',
        selectedPriceId: 'some-price-id',
        selectedPrice,
        formData: { price: 0.1 },
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        orderId: 'order-1',
        itemName: 'item-name',
        selectedPrice,
        formData: { price: 0.1 },
      });
    });

    it('should call getContext with the correct params when formData passed in', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      const formData = {
        quantity: 3,
        selectEstimationPeriod: 'month',
        price: 0.1,
      };

      await getOrderItemContext({
        orderId: 'order-1',
        itemName: 'item-name',
        selectedPriceId: 'some-price-id',
        selectedPrice,
        formData,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        orderId: 'order-1',
        itemName: 'item-name',
        selectedPrice,
        formData,
      });
    });
  });

  describe('getOrderItemErrorPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      await getOrderItemErrorPageContext({
        orderId: 'order-1',
        orderItemType,
        itemName: 'item-name',
        selectedPriceId: 'some-price-id',
        selectedPrice,
        formData: { quantity: '100' },
        validationErrors: {},
      });

      expect(getSelectedPriceManifest.getSelectedPriceManifest.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.getSelectedPriceManifest).toHaveBeenCalledWith({
        orderItemType,
        provisioningType: selectedPrice.provisioningType,
        type: selectedPrice.type,
      });
    });

    it('should call getOrderItemErrorPageContext with the correct params', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      await getOrderItemErrorPageContext({
        orderId: 'order-1',
        itemName: 'item-name',
        selectedPriceId: 'some-price-id',
        selectedPrice,
        formData: {
          quantity: '100  ',
          price: '  0.1',
        },
      });

      expect(contextCreator.getErrorContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getErrorContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        orderId: 'order-1',
        itemName: 'item-name',
        selectedPriceId: 'some-price-id',
        selectedPrice,
        formData: {
          quantity: '100',
          price: '0.1',
        },
      });
    });
  });
});

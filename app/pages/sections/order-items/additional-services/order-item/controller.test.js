import {
  getOrderItemContext,
  saveOrderItem,
} from './controller';
import { postOrderItem } from '../../../../../helpers/api/ordapi/postOrderItem';
import { putOrderItem } from '../../../../../helpers/api/ordapi/putOrderItem';
import * as contextCreator from './contextCreator';
import * as getSelectedPriceManifest from '../../../../../helpers/controllers/manifestProvider';

jest.mock('buying-catalogue-library');
jest.mock('./contextCreator', () => ({ getContext: jest.fn() }));
jest.mock('./commonManifest.json', () => ({ title: 'fake manifest' }));
jest.mock('../../../../../helpers/controllers/manifestProvider', () => ({
  getSelectedPriceManifest: jest.fn(),
}));
jest.mock('../../../../../helpers/api/ordapi/postOrderItem');
jest.mock('../../../../../helpers/api/ordapi/putOrderItem');

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

const orderItemType = 'additional-services';

describe('additional-services order-item controller', () => {
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
        selectedRecipientId: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
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
        odsCode: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        selectedPriceId: 'some-price-id',
        selectedPrice,
        formData: { price: 0.1 },
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        odsCode: 'fake-recipient-id',
        orderId: 'order-1',
        serviceRecipientName: 'Some service recipient 1',
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
        odsCode: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        selectedPriceId: 'some-price-id',
        selectedPrice,
        formData,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        odsCode: 'fake-recipient-id',
        orderId: 'order-1',
        serviceRecipientName: 'Some service recipient 1',
        itemName: 'item-name',
        selectedPrice,
        formData,
      });
    });
  });

  describe('saveOrderItem', () => {
    describe('when order item is new', () => {
      afterEach(() => {
        jest.resetAllMocks();
      });

      const serviceRecipient = { name: 'Recipient 1', odsCode: 'ods1' };
      const item = { id: 'item-1', name: 'Item One' };
      const formData = {
        _csrf: 'E4xB4klq-hLgMvQGHZxQhrHUhh6gSaLz5su8',
        price: '500.49',
        quantity: '1',
        selectEstimationPeriod: 'month',
      };

      describe('with errors', () => {
        it('should return error.response if api request is unsuccessful with 400', async () => {
          const responseData = { errors: [{}] };
          postOrderItem.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

          const response = await saveOrderItem({
            orderId: 'order1',
            orderItemId: 'neworderitem',
            accessToken: 'access_token',
            serviceRecipientId: serviceRecipient.odsCode,
            serviceRecipientName: serviceRecipient.name,
            itemId: item.id,
            itemName: item.name,
            selectedPrice,
            formData,
          });

          expect(response).toEqual(responseData);
        });

        it('should throw an error if api request is unsuccessful with non 400', async () => {
          postOrderItem.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

          try {
            await saveOrderItem({
              orderId: 'order1',
              orderItemId: 'neworderitem',
              accessToken: 'access_token',
              serviceRecipientId: serviceRecipient.odsCode,
              serviceRecipientName: serviceRecipient.name,
              itemId: item.id,
              itemName: item.name,
              selectedPrice,
              formData,
            });
          } catch (err) {
            expect(err).toEqual(new Error());
          }
        });
      });

      describe('with no errors', () => {
        it('should post correctly formatted data', async () => {
          postOrderItem.mockResolvedValueOnce({ data: { orderId: 'order1' } });

          await saveOrderItem({
            orderId: 'order1',
            orderItemId: 'neworderitem',
            accessToken: 'access_token',
            serviceRecipientId: serviceRecipient.odsCode,
            serviceRecipientName: serviceRecipient.name,
            itemId: item.id,
            itemName: item.name,
            selectedPrice,
            formData,
          });

          expect(postOrderItem.mock.calls.length).toEqual(1);
          expect(postOrderItem).toHaveBeenCalledWith({
            accessToken: 'access_token',
            orderId: 'order1',
            serviceRecipientId: serviceRecipient.odsCode,
            serviceRecipientName: serviceRecipient.name,
            itemId: item.id,
            itemName: item.name,
            selectedPrice,
            formData,
          });
        });

        it('should return success as true if data is saved successfully', async () => {
          postOrderItem.mockResolvedValueOnce({ success: true });

          const response = await saveOrderItem({
            orderId: 'order1',
            orderItemId: 'neworderitem',
            accessToken: 'access_token',
            serviceRecipientId: serviceRecipient.odsCode,
            serviceRecipientName: serviceRecipient.name,
            itemId: item.id,
            itemName: item.name,
            selectedPrice,
            formData,
          });

          expect(response.success).toEqual(true);
          expect(response.errors).toEqual(undefined);
        });
      });
    });

    describe('when order item is existing', () => {
      afterEach(() => {
        jest.resetAllMocks();
      });

      const formData = {
        _csrf: 'E4xB4klq-hLgMvQGHZxQhrHUhh6gSaLz5su8',
        price: '500.49',
        quantity: '1',
        selectEstimationPeriod: 'month',
      };

      describe('with errors', () => {
        it('should return error.respose if api request is unsuccessful with 400', async () => {
          const responseData = { errors: [{}] };
          putOrderItem.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

          const response = await saveOrderItem({
            orderId: 'order1',
            orderItemId: 'orderItemId-1',
            accessToken: 'access_token',
            formData,
          });

          expect(response).toEqual(responseData);
        });

        it('should throw an error if api request is unsuccessful with non 400', async () => {
          putOrderItem.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

          try {
            await saveOrderItem({
              orderId: 'order1',
              orderItemId: 'orderItemId-1',
              accessToken: 'access_token',
              formData,
            });
          } catch (err) {
            expect(err).toEqual(new Error());
          }
        });
      });

      describe('with no errors', () => {
        it('should post correctly formatted data', async () => {
          putOrderItem.mockResolvedValueOnce({ data: { orderId: 'order1' } });

          await saveOrderItem({
            orderId: 'order1',
            orderItemId: 'orderItemId-1',
            accessToken: 'access_token',
            formData,
          });

          expect(putOrderItem.mock.calls.length).toEqual(1);
          expect(putOrderItem).toHaveBeenCalledWith({
            accessToken: 'access_token',
            orderId: 'order1',
            orderItemId: 'orderItemId-1',
            formData,
          });
        });

        it('should return success as true if data is saved successfully', async () => {
          putOrderItem.mockResolvedValueOnce({ success: true });

          const response = await saveOrderItem({
            orderId: 'order1',
            orderItemId: 'orderItemId-1',
            accessToken: 'access_token',
            formData,
          });

          expect(response.success).toEqual(true);
          expect(response.errors).toEqual(undefined);
        });
      });
    });
  });
});

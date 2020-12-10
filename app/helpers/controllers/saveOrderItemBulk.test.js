import { saveOrderItemBulk } from './saveOrderItemBulk';
import { postOrderItemBulk } from '../api/ordapi/postOrderItemBulk';

jest.mock('../api/ordapi/postOrderItemBulk');

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

describe('saveOrderItemBulk', () => {
  describe('when order item is new', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    const serviceRecipient = ['ods1'];
    const recipients = [{ name: 'Recipient 1', odsCode: 'ods1' }, { name: 'Recipient 2', odsCode: 'ods2' }];
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
        postOrderItemBulk.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

        const response = await saveOrderItemBulk({
          orderId: 'order1',
          orderItemId: 'neworderitem',
          accessToken: 'access_token',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          recipients,
          selectedRecipients: [serviceRecipient],
          selectedPrice,
          formData,
        });

        expect(response).toEqual({ success: false, errors: responseData.errors });
      });

      it('should throw an error if api request is unsuccessful with non 400', async () => {
        postOrderItemBulk.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

        try {
          await saveOrderItemBulk({
            orderId: 'order1',
            orderItemId: 'neworderitem',
            accessToken: 'access_token',
            serviceRecipientId: serviceRecipient.odsCode,
            serviceRecipientName: serviceRecipient.name,
            itemId: item.id,
            itemName: item.name,
            recipients,
            selectedRecipients: [serviceRecipient],
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
        postOrderItemBulk.mockResolvedValueOnce({ data: { orderId: 'order1' } });

        await saveOrderItemBulk({
          orderId: 'order1',
          orderItemId: 'neworderitem',
          accessToken: 'access_token',
          orderItemType: 'order-type',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          recipients,
          selectedRecipients: serviceRecipient,
          selectedPrice,
          formData,
        });

        expect(postOrderItemBulk.mock.calls.length).toEqual(1);
        expect(postOrderItemBulk).toHaveBeenCalledWith({
          accessToken: 'access_token',
          orderId: 'order1',
          orderItemType: 'order-type',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          recipients: [recipients[0]],
          selectedPrice,
          formData,
        });
      });

      it('should return success as true if data is saved successfully', async () => {
        postOrderItemBulk.mockResolvedValueOnce({ success: true });

        const response = await saveOrderItemBulk({
          orderId: 'order1',
          orderItemId: 'neworderitem',
          accessToken: 'access_token',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          recipients,
          selectedRecipients: [serviceRecipient],
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

    const serviceRecipient = ['ods1'];
    const recipients = [{ name: 'Recipient 1', odsCode: 'ods1' }, { name: 'Recipient 2', odsCode: 'ods2' }];
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
        postOrderItemBulk.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

        const response = await saveOrderItemBulk({
          orderId: 'order1',
          orderItemId: '1',
          accessToken: 'access_token',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          recipients,
          selectedRecipients: [serviceRecipient],
          selectedPrice,
          formData,
        });

        expect(response).toEqual({ success: false, errors: responseData.errors });
      });

      it('should throw an error if api request is unsuccessful with non 400', async () => {
        postOrderItemBulk.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

        try {
          await saveOrderItemBulk({
            orderId: 'order1',
            orderItemId: '1',
            accessToken: 'access_token',
            serviceRecipientId: serviceRecipient.odsCode,
            serviceRecipientName: serviceRecipient.name,
            itemId: item.id,
            itemName: item.name,
            recipients,
            selectedRecipients: [serviceRecipient],
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
        postOrderItemBulk.mockResolvedValueOnce({ data: { orderId: 'order1' } });

        await saveOrderItemBulk({
          orderId: 'order1',
          orderItemId: '1',
          accessToken: 'access_token',
          orderItemType: 'order-type',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          recipients,
          selectedRecipients: serviceRecipient,
          selectedPrice,
          formData,
        });

        expect(postOrderItemBulk.mock.calls.length).toEqual(1);
        expect(postOrderItemBulk).toHaveBeenCalledWith({
          accessToken: 'access_token',
          orderId: 'order1',
          orderItemId: 1,
          orderItemType: 'order-type',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          recipients: [recipients[0]],
          selectedPrice,
          formData,
        });
      });

      it('should return success as true if data is saved successfully', async () => {
        postOrderItemBulk.mockResolvedValueOnce({ success: true });

        const response = await saveOrderItemBulk({
          orderId: 'order1',
          orderItemId: '1',
          accessToken: 'access_token',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          recipients,
          selectedRecipients: [serviceRecipient],
          selectedPrice,
          formData,
        });

        expect(response.success).toEqual(true);
        expect(response.errors).toEqual(undefined);
      });
    });
  });
});

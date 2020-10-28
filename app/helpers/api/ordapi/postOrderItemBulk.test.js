import { postData } from 'buying-catalogue-library';
import { postOrderItemBulk } from './postOrderItemBulk';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('postOrderItemBulk', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const serviceRecipient = { name: 'Recipient 1', odsCode: 'ods1' };
  const item = { id: 'item-1', name: 'Item One' };
  const formData = {
    _csrf: 'E4xB4klq-hLgMvQGHZxQhrHUhh6gSaLz5su8',
    deliveryDate: {
      'deliveryDate-day': '25',
      'deliveryDate-month': '12',
      'deliveryDate-year': '2020',
    },
    price: '500.49',
    practiceSize: ['1'],
  };

  const selectedPrice = {
    priceId: 1,
    provisioningType: 'Patient',
    type: 'flat',
    currencyCode: 'GBP',
    itemUnit: {
      name: 'consultation',
      description: 'per consultation',
    },
    timeUnit: {
      name: 'month',
      description: 'per month',
    },
    price: 0.1,
  };

  describe('with errors', () => {
    it('should throw an error if api request is unsuccessful', async () => {
      const responseData = { errors: [{}] };
      postData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      try {
        await postOrderItemBulk({
          orderId: 'order1',
          orderItemId: 'neworderitem',
          orderItemType: 'SomeOrderItemType',
          accessToken: 'access_token',
          itemId: item.id,
          itemName: item.name,
          selectedPrice,
          recipients: [],
          formData,
        });
      } catch (err) {
        expect(err).toEqual({ response: { data: { errors: [{}] }, status: 400 } });
      }
    });
  });

  describe('with no errors', () => {
    it('should post correctly formatted data', async () => {
      postData.mockResolvedValueOnce({ data: { orderId: 'order1' } });

      await postOrderItemBulk({
        orderId: 'order1',
        orderItemId: 'neworderitem',
        orderItemType: 'SomeOrderItemType',
        accessToken: 'access_token',
        itemId: item.id,
        itemName: item.name,
        selectedPrice,
        recipients: [serviceRecipient],
        formData,
      });

      expect(postData.mock.calls.length).toEqual(1);
      expect(postData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order1/order-items`,
        body: [{
          ...selectedPrice,
          serviceRecipient,
          catalogueItemId: item.id,
          catalogueItemName: item.name,
          catalogueItemType: 'SomeOrderItemType',
          deliveryDate: '2020-12-25',
          quantity: 1,
          estimationPeriod: 'month',
          price: 500.49,
        }],
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true if data is saved successfully', async () => {
      postData.mockResolvedValueOnce({ success: true });

      const response = await postOrderItemBulk({
        orderId: 'order1',
        orderItemId: 'neworderitem',
        orderItemType: 'SomeOrderItemType',
        accessToken: 'access_token',
        itemId: item.id,
        itemName: item.name,
        selectedPrice,
        recipients: [],
        formData,
      });

      expect(response.success).toEqual(true);
      expect(response.errors).toEqual(undefined);
    });
  });
});

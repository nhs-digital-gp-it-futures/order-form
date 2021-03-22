import { saveOrderItem } from './saveOrderItem';
import { putOrderItem } from '../api/ordapi/putOrderItem';

jest.mock('../../logger');
jest.mock('../api/ordapi/putOrderItem');

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
        putOrderItem.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

        const response = await saveOrderItem({
          orderId: 'order1',
          accessToken: 'access_token',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          selectedPrice,
          formData,
        });

        expect(response).toEqual({ success: false, errors: responseData.errors });
      });

      it('should throw an error if api request is unsuccessful with non 400', async () => {
        putOrderItem.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

        try {
          await saveOrderItem({
            orderId: 'order1',
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
        putOrderItem.mockResolvedValueOnce({ data: { orderId: 'order1' } });

        await saveOrderItem({
          orderId: 'order1',
          accessToken: 'access_token',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          catalogueSolutionId: 'some-solution-id',
          selectedPrice,
          formData,
        });

        expect(putOrderItem.mock.calls.length).toEqual(1);
        expect(putOrderItem).toHaveBeenCalledWith({
          accessToken: 'access_token',
          orderId: 'order1',
          serviceRecipientId: serviceRecipient.odsCode,
          serviceRecipientName: serviceRecipient.name,
          itemId: item.id,
          itemName: item.name,
          catalogueSolutionId: 'some-solution-id',
          selectedPrice,
          formData,
        });
      });

      it('should return success as true if data is saved successfully', async () => {
        putOrderItem.mockResolvedValueOnce({ success: true });

        const response = await saveOrderItem({
          orderId: 'order1',
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
});

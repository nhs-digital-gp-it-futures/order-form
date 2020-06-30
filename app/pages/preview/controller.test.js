import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../config';
import { logger } from '../../logger';
import {
  getOrder,
  getPreviewPageContext,
} from './controller';
import * as contextCreator from './contextCreator';
import * as getServiceRecipients from './helpers/getServiceRecipients';
import * as transformOrderItems from './helpers/transformOrderItems';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

jest.mock('./helpers/getServiceRecipients', () => ({
  getServiceRecipients: jest.fn(),
}));

jest.mock('./helpers/transformOrderItems', () => ({
  transformOrderItems: jest.fn(),
}));

describe('order summary preview controller', () => {
  describe('getOrder', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    const accessToken = 'access_token';
    const orderId = 'order-id';

    it('should call getData with the correct params', async () => {
      getData.mockResolvedValueOnce({});

      await getOrder({ orderId, accessToken });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id`,
        accessToken,
        logger,
      });
    });
  });

  describe('getPreviewPageContext', () => {
    afterEach(() => {
      contextCreator.getContext.mockReset();
      getServiceRecipients.getServiceRecipients.mockReset();
      transformOrderItems.transformOrderItems.mockReset();
    });

    it('should call getServiceRecipients with the correct params', () => {
      getServiceRecipients.getServiceRecipients.mockResolvedValueOnce();
      transformOrderItems.transformOrderItems.mockResolvedValueOnce();

      const serviceRecipients = [{ odsCode: 'fakeRecipient' }];
      const orderData = { serviceRecipients };

      getPreviewPageContext({ orderId: 'order-1', orderData });

      expect(getServiceRecipients.getServiceRecipients.mock.calls.length).toEqual(1);
      expect(getServiceRecipients.getServiceRecipients).toHaveBeenCalledWith(serviceRecipients);
    });

    it('should call transformOrderItems with the correct params', () => {
      getServiceRecipients.getServiceRecipients.mockResolvedValueOnce();
      transformOrderItems.transformOrderItems.mockResolvedValueOnce();

      getPreviewPageContext({ orderId: 'order-1', orderData: { orderItems: [17] } });

      expect(transformOrderItems.transformOrderItems.mock.calls.length).toEqual(1);
      expect(transformOrderItems.transformOrderItems).toHaveBeenCalledWith([17]);
    });

    it('should call getContext with the correct params', () => {
      const fakeItem = { catalogueItemType: 'Associated Service', provisioningType: 'Declarative' };
      const orderId = 'order-1';
      const orderData = { description: 'fake order' };
      const recurringCostItems = [fakeItem];
      const serviceRecipients = { fakeRecipient: { odsCode: 'fakeRecipient' } };

      contextCreator.getContext.mockResolvedValueOnce();
      getServiceRecipients.getServiceRecipients.mockReturnValueOnce(serviceRecipients);

      transformOrderItems
        .transformOrderItems
        .mockReturnValueOnce({ oneOffCostItems: {}, recurringCostItems });

      const contextData = {
        orderId,
        orderData,
        recurringCostItems,
        serviceRecipients,
      };

      getPreviewPageContext(contextData);

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(contextData);
    });
  });
});

import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../config';
import { logger } from '../../logger';
import {
  getOrder,
  getPreviewPageContext,
} from './controller';
import * as contextCreator from './contextCreator';
import * as createServiceRecipientsDict from './helpers/createServiceRecipientsDict';
import * as transformOrderItems from './helpers/transformOrderItems';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

jest.mock('./helpers/createServiceRecipientsDict', () => ({
  createServiceRecipientsDict: jest.fn(),
}));

jest.mock('./helpers/transformOrderItems', () => ({
  transformOrderItems: jest.fn(),
}));

describe('order summary preview controller', () => {
  describe('getOrder', () => {
    afterEach(() => {
      jest.resetAllMocks();
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
      createServiceRecipientsDict.createServiceRecipientsDict.mockReset();
      transformOrderItems.transformOrderItems.mockReset();
    });

    it('should call getServiceRecipients with the correct params', () => {
      createServiceRecipientsDict.createServiceRecipientsDict.mockResolvedValueOnce();
      transformOrderItems.transformOrderItems.mockResolvedValueOnce();

      const serviceRecipients = [{ odsCode: 'fakeRecipient' }];
      const orderData = { serviceRecipients };

      getPreviewPageContext({ orderId: 'order-1', orderData });

      expect(createServiceRecipientsDict.createServiceRecipientsDict.mock.calls.length).toEqual(1);
      expect(createServiceRecipientsDict.createServiceRecipientsDict)
        .toHaveBeenCalledWith(serviceRecipients);
    });

    it('should call transformOrderItems with the correct params', () => {
      createServiceRecipientsDict.createServiceRecipientsDict.mockResolvedValueOnce();
      transformOrderItems.transformOrderItems.mockResolvedValueOnce();

      getPreviewPageContext({ orderId: 'order-1', orderData: { orderItems: [17] } });

      expect(transformOrderItems.transformOrderItems.mock.calls.length).toEqual(1);
      expect(transformOrderItems.transformOrderItems).toHaveBeenCalledWith([17]);
    });

    it('should call getContext with the correct params', () => {
      const fakeOneOffCostItem = { catalogueItemType: 'AssociatedService', provisioningType: 'Declarative' };
      const fakeRecurringCostItem = { catalogueItemType: 'AdditionalService', provisioningType: 'Declarative' };
      const orderId = 'order-1';
      const orderItems = [fakeRecurringCostItem, fakeOneOffCostItem];
      const serviceRecipients = { fakeRecipient: { odsCode: 'fakeRecipient' } };
      const orderData = { description: 'fake order', orderItems, serviceRecipients };

      contextCreator.getContext.mockResolvedValueOnce();
      createServiceRecipientsDict
        .createServiceRecipientsDict
        .mockReturnValueOnce(serviceRecipients);

      transformOrderItems
        .transformOrderItems
        .mockReturnValueOnce({
          oneOffCostItems: [fakeOneOffCostItem], recurringCostItems: [fakeRecurringCostItem],
        });

      const expectedParams = {
        orderId,
        orderData,
        oneOffCostItems: [fakeOneOffCostItem],
        recurringCostItems: [fakeRecurringCostItem],
        serviceRecipients,
      };

      getPreviewPageContext({ orderId, orderData });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(expectedParams);
    });
  });
});

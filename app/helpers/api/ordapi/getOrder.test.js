import { getData } from 'buying-catalogue-library';
import { getOrder } from './getOrder';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

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

  it('should return the orderData as returned from the API', async () => {
    getData.mockResolvedValueOnce({ description: 'some-order-data' });

    const { orderData } = await getOrder({ orderId, accessToken });

    expect(orderData).toEqual({ description: 'some-order-data' });
  });

  describe('should return the oneOffCostItems, recurringCostItems', () => {
    const oneOffCostItem1 = {
      catalogueItemType: 'AssociatedService', provisioningType: 'Declarative', itemId: 'one-off-1',
    };
    const oneOffCostItem2 = {
      catalogueItemType: 'AssociatedService', provisioningType: 'Declarative', itemId: 'one-off-2',
    };
    const recurringCostItem1 = {
      catalogueItemType: 'Solution', provisioningType: 'OnDemand', itemId: 'recurring-1',
    };
    const recurringCostItem2 = {
      catalogueItemType: 'Solution', provisioningType: 'OnDemand', itemId: 'recurring-2',
    };

    it('should return a single oneOffCostItems when orderItems of AssociatedService and Declarative are returned from the API', async () => {
      getData.mockResolvedValueOnce({ orderItems: [oneOffCostItem1] });

      const { oneOffCostItems, recurringCostItems } = await getOrder({ orderId, accessToken });

      expect(oneOffCostItems).toEqual([oneOffCostItem1]);
      expect(recurringCostItems).toEqual([]);
    });

    it('should return a single recurringCostItems when orderItems of not AssociatedService and Declarative are returned from the API', async () => {
      getData.mockResolvedValueOnce({ orderItems: [recurringCostItem1] });

      const { oneOffCostItems, recurringCostItems } = await getOrder({ orderId, accessToken });

      expect(oneOffCostItems).toEqual([]);
      expect(recurringCostItems).toEqual([recurringCostItem1]);
    });

    it('should return multiple orderItems from the API as oneOffCostItems or recurringCostItems', async () => {
      getData.mockResolvedValueOnce({
        orderItems: [oneOffCostItem2, recurringCostItem1, recurringCostItem2, oneOffCostItem1],
      });

      const { oneOffCostItems, recurringCostItems } = await getOrder({ orderId, accessToken });

      expect(recurringCostItems).toEqual([recurringCostItem1, recurringCostItem2]);
      expect(oneOffCostItems).toEqual([oneOffCostItem2, oneOffCostItem1]);
    });
  });


  describe('should return the serviceRecipients returned from the API as a dict', () => {
    const plovdivSoftware = {
      name: 'Plovdiv Software',
      odsCode: 'A100001',
    };

    const sofiaSoftware = {
      name: 'Sofia Software',
      odsCode: 'A100002',
    };

    const singleRecipient = [plovdivSoftware];
    const multipleRecipients = [plovdivSoftware, sofiaSoftware];

    it('should return no single recipient provided as an empty object', async () => {
      const expectServiceRecipients = {};

      getData.mockResolvedValueOnce({ serviceRecipients: [] });

      const { serviceRecipients } = await getOrder({ orderId, accessToken });

      expect(serviceRecipients).toEqual(expectServiceRecipients);
    });

    it('should return undefined service recipient provided as an empty object', async () => {
      const expectServiceRecipients = {};

      getData.mockResolvedValueOnce({ serviceRecipients: undefined });

      const { serviceRecipients } = await getOrder({ orderId, accessToken });

      expect(serviceRecipients).toEqual(expectServiceRecipients);
    });

    it('should return a single recipient provided as a dict', async () => {
      const expectServiceRecipients = {
        A100001: plovdivSoftware,
      };

      getData.mockResolvedValueOnce({ serviceRecipients: singleRecipient });

      const { serviceRecipients } = await getOrder({ orderId, accessToken });

      expect(serviceRecipients).toEqual(expectServiceRecipients);
    });

    it('should return a mutliple recipient provided as a dict', async () => {
      const expectServiceRecipients = {
        A100001: plovdivSoftware,
        A100002: sofiaSoftware,
      };

      getData.mockResolvedValueOnce({ serviceRecipients: multipleRecipients });

      const { serviceRecipients } = await getOrder({ orderId, accessToken });

      expect(serviceRecipients).toEqual(expectServiceRecipients);
    });
  });
});

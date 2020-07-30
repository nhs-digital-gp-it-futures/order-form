import { getData } from 'buying-catalogue-library';
import {
  getOrder, sortServiceRecipients, sortOrderItems, groupOrderItemsByOdsCode, sortGroupedOrderItems,
} from './getOrder';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getOrder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const accessToken = 'access_token';
  const orderId = 'order-id';

  const oneOffCostItem1 = {
    catalogueItemType: 'AssociatedService',
    catalogueItemName: 'Apple training',
    provisioningType: 'Declarative',
    itemId: 'one-off-1',
    serviceRecipientsOdsCode: 'recipient1',
  };
  const oneOffCostItem2 = {
    catalogueItemType: 'AssociatedService',
    catalogueItemName: 'Banana training',
    provisioningType: 'Declarative',
    itemId: 'one-off-2',
    serviceRecipientsOdsCode: 'recipient1',
  };
  const recipient1recurringCostItem1 = {
    catalogueItemType: 'AssociatedService',
    catalogueItemName: 'Apple annual training',
    provisioningType: 'OnDemand',
    itemId: 'recurring-2',
    serviceRecipientsOdsCode: 'recipient1',
  };
  const recipient2recurringCostItem1 = {
    catalogueItemType: 'Solution',
    catalogueItemName: 'Cat solution',
    provisioningType: 'OnDemand',
    itemId: 'recurring-1',
    serviceRecipientsOdsCode: 'recipient2',
  };

  const recipient1 = {
    odsCode: 'recipient1',
    name: 'A Recipient',
  };
  const recipient2 = {
    odsCode: 'recipient2',
    name: 'B Recipient',
  };


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

  describe('should return the oneOffCostItems, recurringCostItems sorted by recipientName', () => {
    it('should return a single oneOffCostItems when orderItems of AssociatedService and Declarative are returned from the API', async () => {
      getData.mockResolvedValueOnce({
        orderItems: [oneOffCostItem1], serviceRecipients: [recipient1],
      });

      const { oneOffCostItems, recurringCostItems } = await getOrder({ orderId, accessToken });

      expect(oneOffCostItems).toEqual([oneOffCostItem1]);
      expect(recurringCostItems).toEqual([]);
    });

    it('should return a single recurringCostItems when orderItems is not an AssociatedService and Declarative', async () => {
      getData.mockResolvedValueOnce({
        orderItems: [recipient2recurringCostItem1], serviceRecipients: [recipient2],
      });

      const { oneOffCostItems, recurringCostItems } = await getOrder({ orderId, accessToken });

      expect(oneOffCostItems).toEqual([]);
      expect(recurringCostItems).toEqual([recipient2recurringCostItem1]);
    });

    it('should return multiple orderItems from the API as oneOffCostItems or recurringCostItems', async () => {
      getData.mockResolvedValueOnce({
        orderItems: [
          oneOffCostItem2,
          recipient2recurringCostItem1,
          recipient1recurringCostItem1,
          oneOffCostItem1,
        ],
        serviceRecipients: [recipient2, recipient1],
      });

      const { oneOffCostItems, recurringCostItems } = await getOrder({ orderId, accessToken });

      expect(recurringCostItems).toEqual([
        recipient1recurringCostItem1, recipient2recurringCostItem1,
      ]);
      expect(oneOffCostItems).toEqual([
        oneOffCostItem1, oneOffCostItem2,
      ]);
    });
  });

  describe('should return the serviceRecipients returned from the API as a dict', () => {
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
        [recipient1.odsCode]: recipient1,
      };

      getData.mockResolvedValueOnce({
        orderItems: [oneOffCostItem1], serviceRecipients: [recipient1],
      });

      const { serviceRecipients } = await getOrder({ orderId, accessToken });

      expect(serviceRecipients).toEqual(expectServiceRecipients);
    });

    it('should return a mutliple recipient provided as a dict', async () => {
      const expectServiceRecipients = {
        [recipient1.odsCode]: recipient1,
        [recipient2.odsCode]: recipient2,
      };

      getData.mockResolvedValueOnce({
        orderItems: [
          recipient2recurringCostItem1,
          recipient1recurringCostItem1,
        ],
        serviceRecipients: [recipient2, recipient1],
      });

      const { serviceRecipients } = await getOrder({ orderId, accessToken });

      expect(serviceRecipients).toEqual(expectServiceRecipients);
    });
  });
});

describe('sort service recipients by name', () => {
  const firstRecipient = {
    odsCode: 'A00001',
    name: 'A Recipient',
  };

  const secondRecipient = {
    odsCode: 'A00002',
    name: 'B Recipient',
  };

  it('should return a list of 1 service recipients sorted by name', () => {
    const serviceRecipients = [firstRecipient];

    const sortedServiceRecipients = sortServiceRecipients(serviceRecipients);

    expect(sortedServiceRecipients).toEqual(serviceRecipients);
  });

  it('should return a list of 2 service recipients sorted by name', () => {
    const expectedServiceRecipients = [firstRecipient, secondRecipient];

    const serviceRecipients = [secondRecipient, firstRecipient];

    const sortedServiceRecipients = sortServiceRecipients(serviceRecipients);

    expect(sortedServiceRecipients).toEqual(expectedServiceRecipients);
  });
});

describe('sort groupedOrderItems by catalogueItemName', () => {
  const itemStartingWithA = {
    itemId: '4',
    catalogueItemName: 'A Item-name',
  };

  const itemStartingWithB = {
    itemId: '2',
    catalogueItemName: 'B Item-Name',
  };

  const itemStartingWith1 = {
    itemId: '3',
    catalogueItemName: '1 Item-Name',
  };

  const itemStartingWith2 = {
    itemId: '1',
    catalogueItemName: '2 Item-Name',
  };

  const itemStartingWithAa = {
    itemId: '5',
    catalogueItemName: 'Aa Item-Name',
  };

  it('should return a list of 1 orderItem sorted by catalogueItemName', () => {
    const groupedOrderItems = [itemStartingWithB];

    const sortedGroupedOrderItems = sortGroupedOrderItems(groupedOrderItems);

    expect(sortedGroupedOrderItems).toEqual(groupedOrderItems);
  });

  it('should return a list of 2 orderItems sorted by catalogueItemName', () => {
    const expectedSortedOrderItems = [itemStartingWithA, itemStartingWithAa, itemStartingWithB];

    const groupedOrderItems = [itemStartingWithAa, itemStartingWithB, itemStartingWithA];

    const sortedGroupedOrderItems = sortGroupedOrderItems(groupedOrderItems);

    expect(sortedGroupedOrderItems).toEqual(expectedSortedOrderItems);
  });

  it('should return a list of orderItems sorted with those starting with numbers at the start', () => {
    const expectedSortedOrderItems = [
      itemStartingWith1,
      itemStartingWith2,
      itemStartingWithA,
      itemStartingWithAa,
      itemStartingWithB,
    ];

    const groupedOrderItems = [
      itemStartingWithB,
      itemStartingWith2,
      itemStartingWithA,
      itemStartingWithAa,
      itemStartingWith1,
    ];

    const sortedGroupedOrderItems = sortGroupedOrderItems(groupedOrderItems);

    expect(sortedGroupedOrderItems).toEqual(expectedSortedOrderItems);
  });
});

describe('group orderItems by serviceRecipientOdsCode', () => {
  const recipient1OrderItem1 = {
    id: 'order-item-1',
    serviceRecipientsOdsCode: 'recipient1',
  };

  const recipient1OrderItem2 = {
    id: 'order-item-2',
    serviceRecipientsOdsCode: 'recipient1',
  };

  const recipient2OrderItem1 = {
    id: 'order-item-1',
    serviceRecipientsOdsCode: 'recipient2',
  };

  const recipient2OrderItem2 = {
    id: 'order-item-2',
    serviceRecipientsOdsCode: 'recipient2',
  };

  it('should return a dict of a single order item with the serviceRecipientOdsCode as the key', () => {
    const expectedGroupedOrderItem = {
      recipient1: [recipient1OrderItem1],
    };

    const orderItems = [recipient1OrderItem1];

    const groupedOrderItems = groupOrderItemsByOdsCode(orderItems);

    expect(groupedOrderItems).toEqual(expectedGroupedOrderItem);
  });

  it('should return a dict of a multiple order items with the same serviceRecipientOdsCode', () => {
    const expectedGroupedOrderItem = {
      recipient1: [recipient1OrderItem1, recipient1OrderItem2],
    };

    const orderItems = [recipient1OrderItem1, recipient1OrderItem2];

    const groupedOrderItems = groupOrderItemsByOdsCode(orderItems);

    expect(groupedOrderItems).toEqual(expectedGroupedOrderItem);
  });

  it('should return a dict of a multiple order items with the different serviceRecipientOdsCode', () => {
    const expectedGroupedOrderItem = {
      recipient1: [recipient1OrderItem1, recipient1OrderItem2],
      recipient2: [recipient2OrderItem1, recipient2OrderItem2],
    };

    const orderItems = [
      recipient1OrderItem1, recipient1OrderItem2, recipient2OrderItem1, recipient2OrderItem2,
    ];

    const groupedOrderItems = groupOrderItemsByOdsCode(orderItems);

    expect(groupedOrderItems).toEqual(expectedGroupedOrderItem);
  });
});

describe('sort orderItems by serviceRecipients name and catalogueItemName', () => {
  const recipient1 = { name: 'A recipient', odsCode: 'recipient1' };
  const recipient2 = { name: 'B recipient', odsCode: 'recipient2' };
  const recipient3 = { name: 'C recipient', odsCode: 'recipient3' };

  const recipient1OrderItemStartingWith1 = {
    itemId: '2',
    serviceRecipientsOdsCode: 'recipient1',
    catalogueItemName: '1 Item-name',
  };
  const recipient1OrderItemStartingWithA = {
    itemId: '3',
    serviceRecipientsOdsCode: 'recipient1',
    catalogueItemName: 'A Item-name',
  };
  const recipient1OrderItemStartingWithB = {
    itemId: '1',
    serviceRecipientsOdsCode: 'recipient1',
    catalogueItemName: 'B Item-name',
  };

  const recipient2OrderItemStartingWithA = {
    itemId: '1',
    serviceRecipientsOdsCode: 'recipient2',
    catalogueItemName: '1 Item-name',
  };
  const recipient2OrderItemStartingWithAa = {
    itemId: '3',
    serviceRecipientsOdsCode: 'recipient2',
    catalogueItemName: '1 Item-name',
  };
  const recipient2OrderItemStartingWithB = {
    itemId: '2',
    serviceRecipientsOdsCode: 'recipient2',
    catalogueItemName: 'B Item-name',
  };

  it('return a single order item', () => {
    const serviceRecipients = [recipient1];

    const orderItems = [recipient1OrderItemStartingWith1];

    const sortedOrderItems = sortOrderItems(serviceRecipients, orderItems);

    expect(sortedOrderItems).toEqual([recipient1OrderItemStartingWith1]);
  });

  it('return a single order items for different recipients', () => {
    const serviceRecipients = [recipient2, recipient1];

    const orderItems = [recipient2OrderItemStartingWithA, recipient1OrderItemStartingWith1];

    const sortedOrderItems = sortOrderItems(serviceRecipients, orderItems);

    expect(sortedOrderItems).toEqual([
      recipient1OrderItemStartingWith1, recipient2OrderItemStartingWithA,
    ]);
  });

  it('return a multiple order items for different recipients', () => {
    const serviceRecipients = [recipient2, recipient1];

    const orderItems = [
      recipient2OrderItemStartingWithA,
      recipient1OrderItemStartingWithA,
      recipient2OrderItemStartingWithB,
      recipient1OrderItemStartingWith1,
      recipient2OrderItemStartingWithAa,
      recipient1OrderItemStartingWithB,
    ];

    const sortedOrderItems = sortOrderItems(serviceRecipients, orderItems);

    expect(sortedOrderItems).toEqual([
      recipient1OrderItemStartingWith1,
      recipient1OrderItemStartingWithA,
      recipient1OrderItemStartingWithB,
      recipient2OrderItemStartingWithA,
      recipient2OrderItemStartingWithAa,
      recipient2OrderItemStartingWithB,
    ]);
  });

  it('should not add an entry for service recipients that does not have any orders', () => {
    const serviceRecipients = [recipient2, recipient1, recipient3];

    const orderItems = [
      recipient2OrderItemStartingWithA,
      recipient1OrderItemStartingWithA,
      recipient1OrderItemStartingWith1,
      recipient2OrderItemStartingWithAa,
    ];

    const sortedOrderItems = sortOrderItems(serviceRecipients, orderItems);

    expect(sortedOrderItems).toEqual([
      recipient1OrderItemStartingWith1,
      recipient1OrderItemStartingWithA,
      recipient2OrderItemStartingWithA,
      recipient2OrderItemStartingWithAa,
    ]);
  });
});

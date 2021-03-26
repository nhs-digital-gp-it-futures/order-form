import { getOrderItemPageData, getOrderItemRecipientsPageData } from './getOrderItemPageData';
import { getSelectedPrice } from '../api/bapi/getSelectedPrice';
import { getOrderItem } from '../api/ordapi/getOrderItem';

const req = {};
const fakeSessionManager = {};

jest.mock('../api/bapi/getSelectedPrice');
jest.mock('../api/ordapi/getOrderItem');

describe('getOrderItemPageData', () => {
  describe('when new order item', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should get the selectedItemId from session and return this as itemId', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-item-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.itemId).toEqual('some-selected-item-id');
    });

    it('should get the selectedItemName from session and return this as itemName', async () => {
      fakeSessionManager.getFromSession = () => 'some item name';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.itemName).toEqual('some item name');
    });

    it('should get the selectedRecipientId from session and return this as serviceRecipientId', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-recipient-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.serviceRecipientId).toEqual('some-selected-recipient-id');
    });

    it('should get the selectedRecipientName from session and return this as serviceRecipientName', async () => {
      fakeSessionManager.getFromSession = () => 'some recipient name';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.serviceRecipientName).toEqual('some recipient name');
    });

    it('should get the selectedPriceId from session, call  getSelectedPrice and return the selectedPrice', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-price-id';

      getSelectedPrice.mockResolvedValue({ price: '10.123456' });

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.selectedPrice).toEqual({ price: '10.123456' });
    });

    it('should get the selectedCatalogueSolutionId from session and return this as catalogueSolutionId', async () => {
      fakeSessionManager.getFromSession = () => 'some-catalogue-solution-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.catalogueSolutionId).toEqual('some-catalogue-solution-id');
    });

    it('should return the formData with the price from getSelectedPrice', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-price-id';

      getSelectedPrice.mockResolvedValue({ price: '10.1' });

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.formData).toEqual({ price: '10.1' });
    });
  });

  const recipient = {
    odsCode: 'some-recipient-id',
    name: 'some recipient id',
    quantity: 1,
  };

  describe('when existing order item', () => {
    const mockOrderItemResponse = {
      catalogueItemId: 'some-item-id',
      catalogueItemName: 'some item name',
      serviceRecipients: [recipient],
      estimationPeriod: 'some-estimation-period',
      type: 'some-type',
      provisioningType: 'some-provisioningType',
      itemUnit: {
        name: 'some item unit name',
        description: 'some item unit description',
      },
      price: '12.2306',
      currencyCode: 'GBP',
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItem and return the itemId', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.itemId).toEqual(mockOrderItemResponse.catalogueItemId);
    });

    it('should call getOrderItem and return the itemName', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.itemName).toEqual(mockOrderItemResponse.catalogueItemName);
    });

    it('should call getOrderItem and return the serviceRecipientId', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.serviceRecipientId).toEqual(recipient.odsCode);
    });

    it('should call getOrderItem and return the serviceRecipientName', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.serviceRecipientName).toEqual(recipient.name);
    });

    it('should call getOrderItem and return the selectedPrice', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.selectedPrice).toEqual({
        currencyCode: mockOrderItemResponse.currencyCode,
        price: mockOrderItemResponse.price,
        itemUnit: mockOrderItemResponse.itemUnit,
        type: mockOrderItemResponse.type,
        provisioningType: mockOrderItemResponse.provisioningType,
      });
    });

    it('should call getOrderItem and return the formData without deliveryDate', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.formData).toEqual({
        quantity: recipient.quantity,
        selectEstimationPeriod: mockOrderItemResponse.estimationPeriod,
        price: mockOrderItemResponse.price,
      });
    });

    it('should call getOrderItem and return the formData withDeliveryDate', async () => {
      const mockOrderItemWithDeliveryDate = {
        ...mockOrderItemResponse,
        serviceRecipients: [{ ...recipient, deliveryDate: '2020-02-09T00:00:00' }],
      };

      getOrderItem.mockResolvedValue(mockOrderItemWithDeliveryDate);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.formData).toEqual({
        'deliveryDate-year': '2020',
        'deliveryDate-month': '02',
        'deliveryDate-day': '09',
        quantity: recipient.quantity,
        selectEstimationPeriod: mockOrderItemResponse.estimationPeriod,
        price: '12.2306',
      });
    });
  });
});

describe('getOrderItemRecipientsPageData', () => {
  describe('when new order item', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should get the selectedItemId from session and return this as itemId', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-item-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.itemId).toEqual('some-selected-item-id');
    });

    it('should get the selectedItemName from session and return this as itemName', async () => {
      fakeSessionManager.getFromSession = () => 'some item name';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.itemName).toEqual('some item name');
    });

    it('should get the selectedCatalogueSolutionId from session and return this as catalogueSolutionId', async () => {
      fakeSessionManager.getFromSession = () => 'some-catalogue-solution-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.catalogueSolutionId).toEqual('some-catalogue-solution-id');
    });

    it('should get the selectedItemName from session and return this as itemName', async () => {
      fakeSessionManager.getFromSession = () => 'some item name';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.itemName).toEqual('some item name');
    });

    it('should get the selectedPriceId from session, call  getSelectedPrice and return the selectedPrice', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-price-id';

      getSelectedPrice.mockResolvedValue({ price: '10.123456' });

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.selectedPrice).toEqual({ price: '10.123456' });
    });

    it('should get the selectedCatalogueSolutionId from session and return this as catalogueSolutionId', async () => {
      fakeSessionManager.getFromSession = () => 'some-catalogue-solution-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.catalogueSolutionId).toEqual('some-catalogue-solution-id');
    });

    it('should return the formData with the delivery date and price from getSelectedPrice', async () => {
      fakeSessionManager.getFromSession = () => '02-02-2022';

      getSelectedPrice.mockResolvedValue({ price: '10.1' });

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'neworderitem' });

      expect(pageData.formData).toEqual({ deliveryDate: '02-02-2022', price: '10.1' });
    });
  });

  const recipient = {
    odsCode: 'some-recipient-id',
    name: 'some recipient id',
    quantity: 1,
  };

  describe('when existing order item', () => {
    const mockOrderItemResponse = {
      catalogueItemId: 'some-item-id',
      catalogueItemName: 'some item name',
      estimationPeriod: 'some-estimation-period',
      type: 'some-type',
      provisioningType: 'some-provisioningType',
      itemUnit: {
        name: 'some item unit name',
        description: 'some item unit description',
      },
      price: '12.2306',
      currencyCode: 'GBP',
      serviceRecipients: [
        {
          name: 'Blue Mountain Medical Practice',
          odsCode: 'A10001',
          itemId: 'C000001-01-A10001-34',
          serviceInstanceId: 'SI1-A10001',
          quantity: 55,
          deliveryDate: '2020-09-25',
        },
        {
          name: 'Red Mountain Medical Practice',
          odsCode: 'A10002',
          itemId: 'C000001-01-A10002-6',
          serviceInstanceId: 'SI1-A10002',
          quantity: 4,
          deliveryDate: '2020-09-25',
        },
      ],
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItem and return the itemId', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.itemId).toEqual(mockOrderItemResponse.catalogueItemId);
    });

    it('should call getOrderItem and return the itemName', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.itemName).toEqual(mockOrderItemResponse.catalogueItemName);
    });

    it('should call getOrderItem and return the serviceRecipientId', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.selectedRecipients).toEqual(mockOrderItemResponse.serviceRecipients);
    });

    it('should call getOrderItem and return the catalogueItemName', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.itemName).toEqual(mockOrderItemResponse.catalogueItemName);
    });

    it('should call getOrderItem and return the selectedPrice', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.selectedPrice).toEqual({
        currencyCode: mockOrderItemResponse.currencyCode,
        price: mockOrderItemResponse.price,
        itemUnit: mockOrderItemResponse.itemUnit,
        type: mockOrderItemResponse.type,
        provisioningType: mockOrderItemResponse.provisioningType,
      });
    });

    it('should call getOrderItem and return the formData without deliveryDate', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.formData).toEqual({
        'deliveryDate-year': '2020',
        'deliveryDate-month': '09',
        'deliveryDate-day': '25',
        quantity: mockOrderItemResponse.serviceRecipients[0].quantity,
        selectEstimationPeriod: mockOrderItemResponse.estimationPeriod,
        price: mockOrderItemResponse.price,
      });
    });

    it('should call getOrderItem and return the formData', async () => {
      const mockOrderItemWithDeliveryDate = {
        ...mockOrderItemResponse,
        serviceRecipients: [{ ...recipient, deliveryDate: '2020-02-09T00:00:00' }],
      };

      getOrderItem.mockResolvedValue(mockOrderItemWithDeliveryDate);

      const pageData = await getOrderItemRecipientsPageData({ req, sessionManager: fakeSessionManager, catalogueItemId: 'existingsolution' });

      expect(pageData.formData).toEqual({
        'deliveryDate-year': '2020',
        'deliveryDate-month': '02',
        'deliveryDate-day': '09',
        quantity: recipient.quantity,
        selectEstimationPeriod: mockOrderItemResponse.estimationPeriod,
        price: '12.2306',
      });
    });
  });
});

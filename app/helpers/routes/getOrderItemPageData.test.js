import { getOrderItemPageData } from './getOrderItemPageData';
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

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.itemId).toEqual('some-selected-item-id');
    });

    it('should get the selectedItemName from session and return this as itemName', async () => {
      fakeSessionManager.getFromSession = () => 'some item name';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.itemName).toEqual('some item name');
    });

    it('should get the selectedRecipientId from session and return this as serviceRecipientId', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-recipient-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.serviceRecipientId).toEqual('some-selected-recipient-id');
    });

    it('should get the selectedRecipientName from session and return this as serviceRecipientName', async () => {
      fakeSessionManager.getFromSession = () => 'some recipient name';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.serviceRecipientName).toEqual('some recipient name');
    });

    it('should get the selectedPriceId from session, call  getSelectedPrice and return the selectedPrice', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-price-id';

      getSelectedPrice.mockResolvedValue({ price: 'some-price' });

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.selectedPrice).toEqual({ price: 'some-price' });
    });

    it('should return the formData with the price from getSelectedPrice', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-price-id';

      getSelectedPrice.mockResolvedValue({ price: 'some-price' });

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.formData).toEqual({ price: 'some-price' });
    });
  });

  describe('when existing order item', () => {
    const mockOrderItemResponse = {
      catalogueItemId: 'some-item-id',
      catalogueItemName: 'some item name',
      serviceRecipient: {
        odsCode: 'some-recipient-id',
        name: 'some recipient id',
      },
      quantity: 1,
      estimationPeriod: 'some-estimation-period',
      type: 'some-type',
      provisioningType: 'some-provisioningType',
      itemUnit: {
        name: 'some item unit name',
        description: 'some item unit description',
      },
      price: 'some-price',
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItem and return the itemId', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.itemId).toEqual(mockOrderItemResponse.catalogueItemId);
    });

    it('should call getOrderItem and return the itemName', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.itemName).toEqual(mockOrderItemResponse.catalogueItemName);
    });

    it('should call getOrderItem and return the serviceRecipientId', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.serviceRecipientId).toEqual(mockOrderItemResponse.serviceRecipient.odsCode);
    });

    it('should call getOrderItem and return the serviceRecipientName', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.serviceRecipientName).toEqual(mockOrderItemResponse.serviceRecipient.name);
    });

    it('should call getOrderItem and return the selectedPrice', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.selectedPrice).toEqual({
        price: mockOrderItemResponse.price,
        itemUnit: mockOrderItemResponse.itemUnit,
        type: mockOrderItemResponse.type,
        provisioningType: mockOrderItemResponse.provisioningType,
      });
    });

    it('should call getOrderItem and return the formData without deliveryDate', async () => {
      getOrderItem.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.formData).toEqual({
        quantity: mockOrderItemResponse.quantity,
        selectEstimationPeriod: mockOrderItemResponse.estimationPeriod,
        price: mockOrderItemResponse.price,
      });
    });

    it('should call getOrderItem and return the formData withDeliveryDate', async () => {
      const mockOrderItemWithDeliveryDate = {
        ...mockOrderItemResponse,
        deliveryDate: '2020-02-09T00:00:00',
      };
      getOrderItem.mockResolvedValue(mockOrderItemWithDeliveryDate);

      const pageData = await getOrderItemPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.formData).toEqual({
        'deliveryDate-year': '2020',
        'deliveryDate-month': '02',
        'deliveryDate-day': '09',
        quantity: mockOrderItemResponse.quantity,
        selectEstimationPeriod: mockOrderItemResponse.estimationPeriod,
        price: mockOrderItemResponse.price,
      });
    });
  });
});

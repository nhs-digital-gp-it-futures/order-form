import { getPageData } from './routesHelper';
import * as controller from './controller';

const req = {};
const fakeSessionManager = {};

describe('getPageData', () => {
  describe('when new order item', () => {
    it('should get the selectedSolutionId from session and return this as solutionId', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-solution-id';

      controller.getSolution = jest.fn().mockResolvedValue({});
      controller.getSelectedPrice = jest.fn().mockResolvedValue({});

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'newsolution' });

      expect(pageData.solutionId).toEqual('some-selected-solution-id');
    });

    it('should get the selectedSolutionId from session, call getSolution and return the solutionName', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-solution-id';

      controller.getSolution = jest.fn().mockResolvedValue({ name: 'some solution name' });
      controller.getSelectedPrice = jest.fn().mockResolvedValue({});

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'newsolution' });

      expect(pageData.solutionName).toEqual('some solution name');
    });

    it('should get the selectedRecipientId from session and return this as serviceRecipientId', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-recipient-id';

      controller.getSolution = jest.fn().mockResolvedValue({});
      controller.getSelectedPrice = jest.fn().mockResolvedValue({});

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'newsolution' });

      expect(pageData.serviceRecipientId).toEqual('some-selected-recipient-id');
    });

    it('should get the selectedRecipientName from session and return this as serviceRecipientName', async () => {
      fakeSessionManager.getFromSession = () => 'some recipient name';

      controller.getSolution = jest.fn().mockResolvedValue({});
      controller.getSelectedPrice = jest.fn().mockResolvedValue({});

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'newsolution' });

      expect(pageData.serviceRecipientName).toEqual('some recipient name');
    });

    it('should get the selectedPriceId from session, call getSelectedPrice and return the selectedPrice', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-price-id';

      controller.getSolution = jest.fn().mockResolvedValue({});
      controller.getSelectedPrice = jest.fn().mockResolvedValue({ price: 'some-price' });

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'newsolution' });

      expect(pageData.selectedPrice).toEqual({ price: 'some-price' });
    });

    it('should return the formData with the price from getSelectedPrice', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-price-id';

      controller.getSolution = jest.fn().mockResolvedValue({});
      controller.getSelectedPrice = jest.fn().mockResolvedValue({ price: 'some-price' });

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'newsolution' });

      expect(pageData.formData).toEqual({ price: 'some-price' });
    });
  });

  describe('when existing order item', () => {
    const mockOrderItemResponse = {
      catalogueItemId: 'some-solution-id',
      catalogueItemName: 'some solution name',
      serviceRecipient: {
        odsCode: 'some-recipient-id',
        name: 'some recipient id',
      },
      deliveryDate: '2020-02-09T00:00:00',
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

    it('should call getOrderItem and return the solutionId', async () => {
      controller.getOrderItem = jest.fn().mockResolvedValue(mockOrderItemResponse);

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.solutionId).toEqual(mockOrderItemResponse.catalogueItemId);
    });

    it('should call getOrderItem and return the solutionName', async () => {
      controller.getOrderItem = jest.fn().mockResolvedValue(mockOrderItemResponse);

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.solutionName).toEqual(mockOrderItemResponse.catalogueItemName);
    });

    it('should call getOrderItem and return the serviceRecipientId', async () => {
      controller.getOrderItem = jest.fn().mockResolvedValue(mockOrderItemResponse);

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.serviceRecipientId).toEqual(mockOrderItemResponse.serviceRecipient.odsCode);
    });

    it('should call getOrderItem and return the serviceRecipientName', async () => {
      controller.getOrderItem = jest.fn().mockResolvedValue(mockOrderItemResponse);

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.serviceRecipientName).toEqual(mockOrderItemResponse.serviceRecipient.name);
    });

    it('should call getOrderItem and return the selectedPrice', async () => {
      controller.getOrderItem = jest.fn().mockResolvedValue(mockOrderItemResponse);

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.selectedPrice).toEqual({
        price: mockOrderItemResponse.price,
        itemUnit: mockOrderItemResponse.itemUnit,
        type: mockOrderItemResponse.type,
        provisioningType: mockOrderItemResponse.provisioningType,
      });
    });

    it('should call getOrderItem and return the formData', async () => {
      controller.getOrderItem = jest.fn().mockResolvedValue(mockOrderItemResponse);

      const pageData = await getPageData({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

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

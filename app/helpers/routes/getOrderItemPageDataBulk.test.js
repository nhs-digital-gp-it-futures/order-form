import { getOrderItemPageDataBulk } from './getOrderItemPageDataBulk';
import { getSelectedPrice } from '../api/bapi/getSelectedPrice';
import { getOrderItems } from '../api/ordapi/getOrderItems';

const req = {};
const fakeSessionManager = {};

jest.mock('../api/bapi/getSelectedPrice');
jest.mock('../api/ordapi/getOrderItems');

describe('getOrderItemPageDataBulk', () => {
  describe('when new order item', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should get the selectedItemId from session and return this as itemId', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-item-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.itemId).toEqual('some-selected-item-id');
    });

    it('should get the selectedItemName from session and return this as itemName', async () => {
      fakeSessionManager.getFromSession = () => 'some item name';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.itemName).toEqual('some item name');
    });

    it('should get the selectedRecipientId from session and return this as serviceRecipientId', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-recipient-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.serviceRecipientId).toEqual('some-selected-recipient-id');
    });

    it('should get the selectedRecipientName from session and return this as serviceRecipientName', async () => {
      fakeSessionManager.getFromSession = () => 'some recipient name';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.serviceRecipientName).toEqual('some recipient name');
    });

    it('should get the selectedPriceId from session, call  getSelectedPrice and return the selectedPrice', async () => {
      fakeSessionManager.getFromSession = () => 'some-selected-price-id';

      getSelectedPrice.mockResolvedValue({ price: '1.56789' });

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.selectedPrice).toEqual({ price: '1.56789' });
    });

    it('should get the selectedCatalogueSolutionId from session and return this as catalogueSolutionId', async () => {
      fakeSessionManager.getFromSession = () => 'some-catalogue-solution-id';

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.catalogueSolutionId).toEqual('some-catalogue-solution-id');
    });

    it('should get the recipients from session and return this as recipients', async () => {
      fakeSessionManager.getFromSession = () => [{ name: 'test', odsCode: 'code' }];

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.recipients).toEqual([{ name: 'test', odsCode: 'code' }]);
    });

    it('should get the selectedRecipientsfrom session and return this as selectedRecipients', async () => {
      fakeSessionManager.getFromSession = () => ['odsCode'];

      getSelectedPrice.mockResolvedValue({});

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.selectedRecipients).toEqual(['odsCode']);
    });

    it('should return the formData', async () => {
      fakeSessionManager.getFromSession = () => '2020-11-10';

      getSelectedPrice.mockResolvedValue({ price: 92.828 });

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'neworderitem' });

      expect(pageData.formData).toEqual({
        price: 92.828,
        deliveryDate: [{
          'deliveryDate-day': '10',
          'deliveryDate-month': '11',
          'deliveryDate-year': '2020',
        }],
      });
    });
  });

  describe('when existing order item', () => {
    const mockOrderItemResponse = [{
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
      deliveryDate: '2020-02-09',
      price: 1.829,
    }];

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItems and return the itemId', async () => {
      getOrderItems.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.itemId).toEqual(mockOrderItemResponse[0].catalogueItemId);
    });

    it('should call getOrderItems and return the itemName', async () => {
      getOrderItems.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.itemName).toEqual(mockOrderItemResponse[0].catalogueItemName);
    });

    it('should call getOrderItems and return the serviceRecipientId', async () => {
      getOrderItems.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.serviceRecipientId).toEqual(
        mockOrderItemResponse[0].serviceRecipient.odsCode,
      );
    });

    it('should call getOrderItems and return the serviceRecipientName', async () => {
      getOrderItems.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.serviceRecipientName).toEqual(mockOrderItemResponse[0].serviceRecipient.name);
    });

    it('should call getOrderItems and return the selectedPrice', async () => {
      getOrderItems.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.selectedPrice).toEqual({
        price: mockOrderItemResponse[0].price,
        itemUnit: mockOrderItemResponse[0].itemUnit,
        type: mockOrderItemResponse[0].type,
        provisioningType: mockOrderItemResponse[0].provisioningType,
      });
    });

    it('should call getOrderItems and return the formData', async () => {
      getOrderItems.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.formData).toEqual({
        deliveryDate: [{
          'deliveryDate-year': '2020',
          'deliveryDate-month': '02',
          'deliveryDate-day': '09',
        }],
        quantity: [mockOrderItemResponse[0].quantity],
        price: mockOrderItemResponse[0].price,
      });
    });

    it('should call getOrderItems and return the recipients', async () => {
      getOrderItems.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.recipients).toEqual([mockOrderItemResponse[0].serviceRecipient]);
    });

    it('should call getOrderItems and return the selectedRecipients', async () => {
      getOrderItems.mockResolvedValue(mockOrderItemResponse);

      const pageData = await getOrderItemPageDataBulk({ req, sessionManager: fakeSessionManager, orderItemId: 'existingsolution' });

      expect(pageData.selectedRecipients).toEqual(
        [mockOrderItemResponse[0].serviceRecipient.odsCode],
      );
    });
  });
});

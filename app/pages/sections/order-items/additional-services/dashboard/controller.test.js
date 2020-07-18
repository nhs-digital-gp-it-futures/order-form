import * as contextCreator from './contextCreator';
import {
  getAdditionalServicesPageContext,
  putAdditionalServices,
} from './controller';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';
import { putOrderSection } from '../../../../../helpers/api/ordapi/putOrderSection';

jest.mock('buying-catalogue-library');
jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../../../helpers/api/ordapi/getOrderItems');
jest.mock('../../../../../helpers/api/ordapi/getOrderDescription');
jest.mock('../../../../../helpers/api/ordapi/putOrderSection');

const accessToken = 'access_token';
const orderId = 'order-id';

describe('additional-services controller', () => {
  describe('getAdditionalServicesPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItems with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({ orderId, catalogueItemType: 'some-type', accessToken });
      expect(getOrderItems.mock.calls.length).toEqual(1);
      expect(getOrderItems).toHaveBeenCalledWith({
        orderId: 'order-id',
        catalogueItemType: 'some-type',
        accessToken,
      });
    });

    it('should call getOrderDescription with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({ orderId, accessToken });
      expect(getOrderDescription.mock.calls.length).toEqual(1);
      expect(getOrderDescription).toHaveBeenCalledWith({
        orderId,
        accessToken,
      });
    });

    it('should call getContext with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription
        .mockResolvedValueOnce({ description: 'some order' });
      contextCreator.getContext.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({ orderId, accessToken });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(
        { orderId, orderDescription: 'some order', orderItems: [] },
      );
    });
  });

  describe('putAdditionalServices', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
  });

  it('should call putOrderSection once with the correct params', async () => {
    putOrderSection.mockResolvedValueOnce({});

    await putAdditionalServices({
      orderId, accessToken,
    });

    expect(putOrderSection.mock.calls.length).toEqual(1);
    expect(putOrderSection).toHaveBeenCalledWith({
      orderId,
      sectionId: 'additional-services',
      accessToken,
    });
  });

  it('should return success: true if put is successful', async () => {
    putOrderSection.mockResolvedValueOnce({ success: true });

    const response = await putAdditionalServices({
      orderId, accessToken,
    });
    expect(response).toEqual({ success: true });
  });
});

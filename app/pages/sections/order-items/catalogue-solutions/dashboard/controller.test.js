import * as contextCreator from './contextCreator';
import {
  getCatalogueSolutionsPageContext,
  putCatalogueSolutions,
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

describe('catalogue-solutions controller', () => {
  describe('getCatalogueSolutionsPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItems with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({ description: 'some description' });

      await getCatalogueSolutionsPageContext({ orderId, accessToken });
      expect(getOrderItems.mock.calls.length).toEqual(1);
      expect(getOrderItems).toHaveBeenCalledWith({
        orderId: 'order-id',
        catalogueItemType: 'Solution',
        accessToken,
      });
    });

    it('should call getOrderDescription with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({ description: 'some description' });

      await getCatalogueSolutionsPageContext({ orderId, accessToken });
      expect(getOrderDescription.mock.calls.length).toEqual(1);
      expect(getOrderDescription).toHaveBeenCalledWith({
        orderId,
        accessToken,
      });
    });

    it('should call getContext with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({ description: 'some description' });

      contextCreator.getContext.mockResolvedValueOnce({});

      await getCatalogueSolutionsPageContext({ orderId, accessToken });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, orderDescription: 'some description', orderItems: [] });
    });
  });

  describe('putCatalogueSolutions', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call putOrderSection once with the correct params', async () => {
      putOrderSection.mockResolvedValueOnce({});

      await putCatalogueSolutions({
        orderId, accessToken,
      });

      expect(putOrderSection.mock.calls.length).toEqual(1);
      expect(putOrderSection).toHaveBeenCalledWith({
        orderId,
        sectionId: 'catalogue-solutions',
        accessToken,
      });
    });

    it('should return success: true if put is successful', async () => {
      putOrderSection.mockResolvedValueOnce({ success: true });

      const response = await putCatalogueSolutions({
        orderId, accessToken,
      });
      expect(response).toEqual({ success: true });
    });
  });
});

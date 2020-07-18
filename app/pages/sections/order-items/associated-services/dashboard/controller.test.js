import * as contextCreator from './contextCreator';
import {
  getAssociatedServicesPageContext,
  putAssociatedServices,
} from './controller';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';
import { putOrderSection } from '../../../../../helpers/api/ordapi/putOrderSection';

jest.mock('buying-catalogue-library');
jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../../../helpers/api/ordapi/getOrderDescription');
jest.mock('../../../../../helpers/api/ordapi/putOrderSection');

const accessToken = 'access_token';
const orderId = 'order-id';

describe('associated-services controller', () => {
  describe('getAssociatedServicesPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderDescription with the correct params', async () => {
      getOrderDescription.mockResolvedValueOnce({ description: 'some description' });

      await getAssociatedServicesPageContext({ orderId, accessToken });
      expect(getOrderDescription.mock.calls.length).toEqual(1);
      expect(getOrderDescription).toHaveBeenCalledWith({
        orderId,
        accessToken,
      });
    });

    it('should call getContext with the correct params', async () => {
      getOrderDescription.mockResolvedValueOnce({ description: 'some description' });
      contextCreator.getContext.mockResolvedValueOnce({});

      await getAssociatedServicesPageContext({ orderId, accessToken });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(
        { orderId, orderDescription: 'some description' },
      );
    });
  });

  describe('putAssociatedServices', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call putOrderSection once with the correct params', async () => {
      putOrderSection.mockResolvedValueOnce({});

      await putAssociatedServices({
        orderId, accessToken,
      });

      expect(putOrderSection.mock.calls.length).toEqual(1);
      expect(putOrderSection).toHaveBeenCalledWith({
        orderId,
        sectionId: 'associated-services',
        accessToken,
      });
    });

    it('should return success: true if put is successful', async () => {
      putOrderSection.mockResolvedValueOnce({ success: true });

      const response = await putAssociatedServices({
        orderId, accessToken,
      });
      expect(response).toEqual({ success: true });
    });
  });
});

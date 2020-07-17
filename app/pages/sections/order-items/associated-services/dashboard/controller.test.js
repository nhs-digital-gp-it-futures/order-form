import * as contextCreator from './contextCreator';
import {
  getAssociatedServicesPageContext,
  putAssociatedServices,
} from './controller';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';

jest.mock('buying-catalogue-library');
jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../../../helpers/api/ordapi/getOrderDescription');

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

    describe('putAssociatedServices', () => {
      afterEach(() => {
        jest.resetAllMocks();
      });
    });

    const formattedPutData = {
      status: 'complete',
    };

    it('should call putData once with the correct params', async () => {
      putData.mockResolvedValueOnce({});

      await putAssociatedServices({
        orderId, accessToken,
      });

      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/associated-services`,
        body: formattedPutData,
        accessToken,
        logger,
      });
    });

    it('should return success: true if put is successful', async () => {
      putData.mockResolvedValueOnce({});

      const response = await putAssociatedServices({
        orderId, accessToken,
      });
      expect(response).toEqual({ success: true });
    });

    it('should throw an error if api request is unsuccessful with non 400', async () => {
      putData.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

      try {
        await putAssociatedServices({
          orderId: 'order-id', accessToken: 'access_token',
        });
      } catch (err) {
        expect(err).toEqual(new Error());
      }
    });
  });
});

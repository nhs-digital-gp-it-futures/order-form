import * as contextCreator from './contextCreator';
import {
  getAssociatedServicesPageContext,
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
  });
});

import * as contextCreator from './contextCreator';
import {
  getAdditionalServicesPageContext,
} from './controller';

jest.mock('../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const orderId = 'order-id';

describe('additional-services controller', () => {
  describe('getAdditionalServicesPageContext', () => {
    afterEach(() => {
      contextCreator.getContext.mockReset();
    });

    it('should call getContext with the correct params', async () => {
      contextCreator.getContext.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({ orderId });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, orderDescription: undefined });
    });
  });
});

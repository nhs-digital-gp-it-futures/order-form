import * as contextCreator from './contextCreator';
import {
  getAssociatedServicesPageContext,
} from './controller';

jest.mock('buying-catalogue-library');
jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const orderId = 'order-id';

describe('associated-services controller', () => {
  describe('getAssociatedServicesPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getContext with the correct params', async () => {
      await getAssociatedServicesPageContext({ orderId });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(
        { orderId },
      );
    });
  });
});

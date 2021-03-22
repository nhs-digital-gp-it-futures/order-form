import { fakeSessionManager } from 'buying-catalogue-library';
import { getDeleteCatalogueSolutionConfirmationContext } from './controller';
import { getOrderDescription } from '../../../../../../helpers/routes/getOrderDescription';
import { logger } from '../../.../../../../../../logger';
import * as contextCreator from './contextCreator';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../helpers/routes/getOrderDescription');
jest.mock('../../../logger');

describe('Delete Catalogue Confirmation controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getDeleteCatalogueSolutionConfirmationContext', () => {
    it('should call getContext with the correct params', async () => {
      const orderDescription = 'some-order-description';

      contextCreator.getContext.mockResolvedValueOnce();
      getOrderDescription.mockResolvedValueOnce(orderDescription);

      const orderItemId = 'order-item-id';
      const accessToken = 'access-token';

      await getDeleteCatalogueSolutionConfirmationContext({
        req: { params: { orderId } },
        sessionManager: fakeSessionManager,
        accessToken,
        logger,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, orderDescription });
    });

    it('should call getOrderDescription with the correct params', async () => {
      contextCreator.getContext.mockResolvedValueOnce();
      getOrderDescription.mockResolvedValueOnce('');

      const accessToken = 'access-token';
      const req = { params: { orderId: 'order-item-id' } };

      await getDeleteCatalogueSolutionConfirmationContext({
        req,
        sessionManager: fakeSessionManager,
        accessToken,
        logger,
      });

      expect(getOrderDescription.mock.calls.length).toEqual(1);
      expect(getOrderDescription).toHaveBeenCalledWith({
        req,
        sessionManager: fakeSessionManager,
        accessToken,
        logger,
      });
    });

    it('should return the expected result', async () => {
      const expectedContext = { context: 'contextData' };

      contextCreator.getContext.mockResolvedValueOnce(expectedContext);
      getOrderDescription.mockResolvedValueOnce('');

      const actualContext = await getDeleteCatalogueSolutionConfirmationContext({
        req: { params: { orderId: 'order-item-id' } },
        sessionManager: fakeSessionManager,
        accessToken: 'access-token',
        logger,
      });

      expect(actualContext).toEqual(expectedContext);
    });
  });
});

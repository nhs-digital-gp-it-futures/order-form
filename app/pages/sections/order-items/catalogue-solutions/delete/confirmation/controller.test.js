import { fakeSessionManager } from 'buying-catalogue-library';
import { getDeleteCatalogueSolutionConfirmationContext } from './controller';
import { logger } from '../../../../../../logger';
import * as contextCreator from './contextCreator';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('Delete Catalogue Confirmation controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getDeleteCatalogueSolutionConfirmationContext', () => {
    it('should call getContext with the correct params', async () => {
      const orderId = 'order-id';
      const solutionName = 'catalogue-solution';
      const accessToken = 'access-token';

      await getDeleteCatalogueSolutionConfirmationContext({
        req: { params: { orderId, solutionName } },
        sessionManager: fakeSessionManager,
        accessToken,
        logger,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, solutionName });
    });

    it('should return the expected result', async () => {
      const expectedContext = { context: 'contextData' };

      contextCreator.getContext.mockResolvedValueOnce(expectedContext);

      const actualContext = await getDeleteCatalogueSolutionConfirmationContext({
        req: { params: { orderId: 'order-id', solutionName: 'catalogue-solution' } },
        sessionManager: fakeSessionManager,
        accessToken: 'access-token',
        logger,
      });

      expect(actualContext).toEqual(expectedContext);
    });
  });
});

import { deleteCatalogueSolution as apiDeleteCatalogueSolution } from '../../../../../helpers/api/ordapi/deleteCatalogueSolution';
import { deleteCatalogueSolution } from './controller';

jest.mock('../../../../../helpers/api/ordapi/deleteCatalogueSolution');

describe('catalogue-solutions delete controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('deleteCatalogueSolution', () => {
    it('should call deleteCatalogueSolution with the correct params', async () => {
      apiDeleteCatalogueSolution.mockResolvedValueOnce();

      const orderId = 'order-id';
      const orderItemId = 'order-item-id';
      const accessToken = 'access-token';

      await deleteCatalogueSolution({ orderId, orderItemId, accessToken });

      expect(apiDeleteCatalogueSolution.mock.calls.length).toEqual(1);
      expect(apiDeleteCatalogueSolution)
        .toHaveBeenCalledWith({ orderId, orderItemId, accessToken });
    });
  });
});

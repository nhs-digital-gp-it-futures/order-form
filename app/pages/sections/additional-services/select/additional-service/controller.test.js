import { getData } from 'buying-catalogue-library';
import {
  solutionsApiUrl as bapiUrl,
  orderApiUrl,
} from '../../../../../config';
import { logger } from '../../../../../logger';
import {
  getAdditionalServicePageContext,
  findAdditionalServices,
  findAddedCatalogueSolutions,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('additional-services select-additional-service controller', () => {
  describe('getAdditionalServicePageContext', () => {
    it('should call getContext with the correct params', () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      getAdditionalServicePageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });

  describe('findAdditionalServices', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ additionalServices: [] });

      const addedCatalogueSolutions = ['1', '2', '3'];
      await findAdditionalServices({ addedCatalogueSolutions, accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${bapiUrl}/api/v1/additional-services?solutionIds=1&solutionIds=2&solutionIds=3`,
        accessToken: 'access_token',
        logger,
      });
    });
  });

  describe('findAddedCatalogueSolutions', () => {
    afterEach(() => {
      getData.mockReset();
    });

    const orderId = 'order-id';

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ catalogueSolutions: [] });

      await findAddedCatalogueSolutions({ orderId, accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/${orderId}/sections/catalogue-solutions`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return a list of catalogue item ids', async () => {
      getData
        .mockResolvedValueOnce({
          catalogueSolutions: [
            {
              catalogueItemId: 'some catalogue item id',
              catalogueItemName: 'some catalogue item name',
            },
          ],
        });

      const catalogueItemIds = await findAddedCatalogueSolutions({ orderId, accessToken: 'access_token' });
      expect(catalogueItemIds).toEqual(['some catalogue item id']);
    });
  });
});

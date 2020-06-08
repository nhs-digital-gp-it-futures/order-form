import { getData } from 'buying-catalogue-library';
import { solutionsApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import * as contextCreator from './contextCreator';
import {
  getsolutionPricePageContext,
} from './controller';

jest.mock('buying-catalogue-library');
jest.mock('../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const accessToken = 'access_token';
const orderId = 'order-id';
const supplierId = 'supp-1';

const solutionPricingData = {
  id: supplierId,
  name: 'name',
  prices: [
    {
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'patient',
        description: 'per patient',
      },
      timeUnit: {
        name: 'year',
        description: 'per year',
      },
      price: 1.64,
    },
  ],
};

describe('catalogue-solutions controller', () => {
  describe('getCatalogueSolutionsPageContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('should call getData with the correct params', async () => {
      getData.mockResolvedValueOnce({});

      await getsolutionPricePageContext({ orderId, supplierId, accessToken });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/solutions/${supplierId}/pricing`,
        accessToken,
        logger,
      });
    });

    it('should call getContext with the correct params', async () => {
      getData.mockResolvedValueOnce(solutionPricingData);
      contextCreator.getContext.mockResolvedValueOnce({});

      await getsolutionPricePageContext({ orderId, supplierId, accessToken });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, solutionPricingData });
    });
  });
});

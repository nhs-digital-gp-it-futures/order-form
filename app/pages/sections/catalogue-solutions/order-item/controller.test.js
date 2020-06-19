import { getData } from 'buying-catalogue-library';
import { solutionsApiUrl, organisationApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import { getRecipientName, getSelectedPrice, getOrderItemContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

jest.mock('../select/recipient/controller', () => ({
  getSolution: () => ({ name: 'solution-name' }),
}));

const selectedPrice = {
  priceId: 1,
  provisioningModel: 'OnDemand',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.1,
};

describe('catalogue-solutions order-item controller', () => {
  describe('getOrderItemContext', () => {
    afterEach(() => {
      getData.mockReset();

      contextCreator.getContext
        .mockResolvedValueOnce();
    });
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();
      getData
        .mockResolvedValueOnce({
          name: 'Some service recipient 1',
          odsCode: 'fake-recipient-id',
        });
      getData
        .mockResolvedValueOnce(selectedPrice);

      await getOrderItemContext({
        orderId: 'order-1',
        selectedSolutionId: 'solution-1',
        selectedRecipientId: 'fake-recipient-id',
        selectedPriceId: 'some-price-id',
        accessToken: 'token',
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        odsCode: 'fake-recipient-id',
        orderId: 'order-1',
        serviceRecipientName: 'Some service recipient 1',
        solutionName: 'solution-name',
        selectedPrice,
      });
    });
  });

  describe('getRecipient', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: {} });

      await getRecipientName({ selectedRecipientId: 'org-1', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${organisationApiUrl}/api/v1/ods/org-1`,
        accessToken: 'access_token',
        logger,
      });
    });
  });

  describe('getPrice', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: {} });

      await getSelectedPrice({ selectedPriceId: 'price-1', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/prices/price-1`,
        accessToken: 'access_token',
        logger,
      });
    });
  });
});

import { getData } from 'buying-catalogue-library';
import { organisationApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import { getRecipientName, getOrderItemContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

jest.mock('../select/recipient/controller', () => ({
  getSolution: () => ({ name: 'solution-name' }),
}));

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

      await getOrderItemContext({
        orderId: 'order-1',
        selectedSolutionId: 'solution-1',
        selectedRecipientId: 'fake-recipient-id',
        accessToken: 'token',
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        odsCode: 'fake-recipient-id',
        orderId: 'order-1',
        serviceRecipientName: 'Some service recipient 1',
        solutionName: 'solution-name',
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
});

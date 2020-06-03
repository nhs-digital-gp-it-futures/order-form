import { getData } from 'buying-catalogue-library';
import { getServiceRecipientsContext } from './controller';
import { logger } from '../../../logger';
import { organisationApiUrl, orderApiUrl } from '../../../config';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');
jest.mock('../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('service-recipients controller', () => {
  describe('getServiceRecipientsContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('calls getData once with correct params', async () => {
      getData
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ serviceRecipients: [] });

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(2);
      expect(getData).toHaveBeenNthCalledWith(1, {
        endpoint: `${organisationApiUrl}/api/v1/Organisations/org-id/service-recipients`,
        accessToken: 'access_token',
        logger,
      });
      expect(getData).toHaveBeenNthCalledWith(2, {
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/service-recipients`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('calls getContext once with correct params if data returned', async () => {
      getData
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ serviceRecipients: [] });
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id' });
    });
  });
});

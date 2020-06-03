import { getData } from 'buying-catalogue-library';
import { getServiceRecipientsContext } from './controller';
import { logger } from '../../../logger';
import { organisationApiUrl } from '../../../config';
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
        .mockResolvedValueOnce({});

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${organisationApiUrl}/api/v1/Organisations/org-id/service-recipients`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('calls getContext once with correct params if data returned', async () => {
      getData
        .mockResolvedValueOnce({});
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id' });
    });
  });
});

import { getServiceRecipientsContext } from './controller';
import * as contextCreator from './contextCreator';
import { getRecipients as getRecipientsFromOrdapi } from '../../../../../../helpers/api/ordapi/getRecipients';
import { getServiceRecipients as getRecipientsFromOapi } from '../../../../../../helpers/api/oapi/getServiceRecipients';

jest.mock('../../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../../../../helpers/api/ordapi/getRecipients');
jest.mock('../../../../../../helpers/api/oapi/getServiceRecipients');

const dataFromOapi = [{
  name: 'Some service recipient 1',
  odsCode: 'ods1',
}, {
  name: 'Some service recipient 2',
  odsCode: 'ods2',
}];

const dataFromOrdapi = {
  serviceRecipients: [{
    name: 'Some service recipient 2',
    odsCode: 'ods2',
  }],
};

describe('service-recipients controller', () => {
  describe('getServiceRecipientsContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls getRecipientsFromOapi and then getRecipientsFromOrdapi with correct params', async () => {
      getRecipientsFromOapi.mockResolvedValueOnce({});
      getRecipientsFromOrdapi.mockResolvedValueOnce({ serviceRecipients: [] });

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

      expect(getRecipientsFromOapi.mock.calls.length).toEqual(1);
      expect(getRecipientsFromOapi).toHaveBeenCalledWith({
        orgId: 'org-id',
        accessToken: 'access_token',
      });

      expect(getRecipientsFromOrdapi.mock.calls.length).toEqual(1);
      expect(getRecipientsFromOrdapi).toHaveBeenCalledWith({
        orderId: 'order-id',
        accessToken: 'access_token',
      });
    });

    it('calls getContext once with correct params if data returned from OAPI', async () => {
      getRecipientsFromOapi.mockResolvedValueOnce(dataFromOapi);
      getRecipientsFromOrdapi.mockResolvedValueOnce({ serviceRecipients: [] });
      contextCreator.getContext.mockResolvedValueOnce();

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        serviceRecipientsData: dataFromOapi,
        selectedRecipientIdsData: [],
      });
    });

    it('calls getContext once with correct params if data returned from OAPI and selectStatus is passed in', async () => {
      getRecipientsFromOapi.mockResolvedValueOnce(dataFromOapi);
      getRecipientsFromOrdapi.mockResolvedValueOnce({ serviceRecipients: [] });
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getServiceRecipientsContext({
        orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token', selectStatus: 'select',
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        serviceRecipientsData: dataFromOapi,
        selectedRecipientIdsData: [],
        selectStatus: 'select',
      });
    });

    it('calls getContext once with correct params if data returned from OAPI and selected recipients data is returned from ORDAPI', async () => {
      getRecipientsFromOapi.mockResolvedValueOnce(dataFromOapi);
      getRecipientsFromOrdapi.mockResolvedValueOnce(dataFromOrdapi);
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        serviceRecipientsData: dataFromOapi,
        selectedRecipientIdsData: dataFromOrdapi.serviceRecipients,
      });
    });
  });
});

import { getData, putData } from 'buying-catalogue-library';
import { getServiceRecipientsContext, putServiceRecipients } from './controller';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';
import * as contextCreator from './contextCreator';
import { getServiceRecipients } from '../../../helpers/api/oapi/getServiceRecipients';

jest.mock('buying-catalogue-library');
jest.mock('../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../helpers/api/oapi/getServiceRecipients');

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

const mockData = {
  _csrf: 'testCSRF',
  XX1: 'Some service recipient 1',
  XX2: 'Some service recipient 2',
};

const formattedMockData = {
  serviceRecipients: [
    { name: 'Some service recipient 1', odsCode: 'XX1' },
    { name: 'Some service recipient 2', odsCode: 'XX2' },
  ],
};

describe('service-recipients controller', () => {
  describe('getServiceRecipientsContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('calls getData twice with correct params', async () => {
      getData
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ serviceRecipients: [] });
      getServiceRecipients.mockResolvedValueOnce({});

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenNthCalledWith(1, {
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/service-recipients`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('calls getContext once with correct params if data returned from OAPI', async () => {
      getData
        .mockResolvedValueOnce({ serviceRecipients: [] });
      contextCreator.getContext
        .mockResolvedValueOnce();
      getServiceRecipients.mockResolvedValueOnce(dataFromOapi);

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        serviceRecipientsData: dataFromOapi,
        selectedRecipientIdsData: [],
      });
    });

    it('calls getContext once with correct params if data returned from OAPI and selectStatus is passed in', async () => {
      getData
        .mockResolvedValueOnce({ serviceRecipients: [] });
      contextCreator.getContext
        .mockResolvedValueOnce();
      getServiceRecipients.mockResolvedValueOnce(dataFromOapi);

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
      getData
        .mockResolvedValueOnce(dataFromOrdapi);
      contextCreator.getContext
        .mockResolvedValueOnce();
      getServiceRecipients.mockResolvedValueOnce(dataFromOapi);

      await getServiceRecipientsContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        serviceRecipientsData: dataFromOapi,
        selectedRecipientIdsData: dataFromOrdapi.serviceRecipients,
      });
    });
  });

  describe('putServiceRecipients', () => {
    beforeEach(() => {
      putData.mockReset();
    });

    it('should call putData once with the correct params', async () => {
      putData
        .mockResolvedValueOnce({});

      await putServiceRecipients({
        orderId: 'order-id', data: mockData, accessToken: 'access_token',
      });
      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/service-recipients`,
        body: formattedMockData,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true if data is saved successfully', async () => {
      putData
        .mockResolvedValueOnce({});
      const response = await putServiceRecipients({
        orderId: 'order-id', data: mockData, accessToken: 'access_token',
      });
      expect(response.success).toEqual(true);
      expect(response.errors).toEqual(undefined);
    });
  });
});

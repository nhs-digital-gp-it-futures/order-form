import {
  getSelectSolutionPriceEndpoint,
  getServiceRecipientsContext,
  getServiceRecipientsErrorPageContext,
  setContextIfBackFromCatalogueSolutionEdit,
  getSelectStatus,
} from './controller';
import * as contextCreator from './contextCreator';
import { baseUrl } from '../../../../../../config';

jest.mock('../../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
  getErrorContext: jest.fn(),
}));

const dataFromOapi = [{
  name: 'Some service recipient 1',
  odsCode: 'ods1',
}, {
  name: 'Some service recipient 2',
  odsCode: 'ods2',
}];

describe('service-recipients controller', () => {
  describe('getSelectSolutionPriceEndpoint', () => {
    it('returns expected string when orderId and orderItemId input', () => {
      const orderId = 'C010000-01';
      const orderItemId = 421;
      const expected = `/organisation/${orderId}/catalogue-solutions/${orderItemId}`;

      expect(getSelectSolutionPriceEndpoint(orderId, orderItemId)).toEqual(expected);
    });
  });

  describe('getServiceRecipientsContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls getContext once with correct params', async () => {
      contextCreator.getContext.mockResolvedValueOnce();

      const orderId = 'order-id';
      const itemName = 'Solution One';
      const selectStatus = 'select';
      const selectedRecipients = ['00A'];

      await getServiceRecipientsContext({
        orderId,
        itemName,
        selectStatus,
        serviceRecipients: dataFromOapi,
        selectedRecipients,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId,
        itemName,
        serviceRecipientsData: dataFromOapi,
        selectedRecipientIdsData: selectedRecipients,
        selectStatus,
      });
    });
  });

  describe('getServiceRecipientsErrorPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls getErrorContext once with correct params', async () => {
      contextCreator.getErrorContext.mockResolvedValueOnce();

      const orderId = 'order-id';
      const itemName = 'Solution One';
      const selectStatus = 'select';
      const selectedRecipients = ['00A'];

      await getServiceRecipientsErrorPageContext({
        orderId,
        itemName,
        selectStatus,
        serviceRecipients: dataFromOapi,
        selectedRecipients,
        solutionPrices: [{}],
        validationErrors: [],
      });

      expect(contextCreator.getErrorContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getErrorContext).toHaveBeenCalledWith({
        orderId,
        itemName,
        serviceRecipientsData: dataFromOapi,
        selectedRecipientIdsData: selectedRecipients,
        selectStatus,
        solutionPrices: [{}],
        validationErrors: [],
      });
    });
  });

  describe('setContextIfBackFromCatalogueSolutionEdit', () => {
    const orderId = 'K2738473-724';
    const orderItemId = 73984;

    describe('sets context values if request body has orderItemId', () => {
      const context = { backLinkHref: 'some-value' };
      const request = {
        body: { orderItemId },
        query: {},
        headers: {},
      };

      setContextIfBackFromCatalogueSolutionEdit(request, context, orderId);

      expect(context.backLinkHref).toEqual(`${baseUrl}${getSelectSolutionPriceEndpoint(orderId, orderItemId)}`);
      expect(context.orderItemId).toEqual(orderItemId);
    });

    describe('sets context values if request query has orderItemId', () => {
      const context = { backLinkHref: 'some-value' };
      const request = {
        body: {},
        query: { orderItemId },
        headers: {},
      };

      setContextIfBackFromCatalogueSolutionEdit(request, context, orderId);

      expect(context.backLinkHref).toEqual(`${baseUrl}${getSelectSolutionPriceEndpoint(orderId, orderItemId)}`);
      expect(context.orderItemId).toEqual(orderItemId);
    });

    describe('sets context values if referer ends with Select Solution Price endpoint', () => {
      const context = { backLinkHref: 'some-value' };
      const request = {
        body: {},
        query: {},
        headers: { referer: `https://buyingcatalogue.co.uk/order/organisation/${orderId}/catalogue-solutions/${orderItemId}` },
      };

      setContextIfBackFromCatalogueSolutionEdit(request, context, orderId);

      expect(context.backLinkHref).toEqual(request.headers.referer);
      expect(context.orderItemId).toEqual(orderItemId.toString());
    });

    describe('does not set context values if request query has no orderItemId and referer does not end with Select Solution Price endpoint', () => {
      const context = { backLinkHref: 'some-value' };
      const request = {
        body: {},
        query: {},
        headers: { referer: `https://buyingcatalogue.co.uk/order/organisation/${orderId}/some-URL` },
      };

      setContextIfBackFromCatalogueSolutionEdit(request, context, orderId);

      expect(context.backLinkHref).toEqual('some-value');
      expect(context.orderItemId).toEqual(undefined);
    });
  });

  describe('getSelectStatus', () => {
    it('if selectStatus is passed, return it', async () => {
      const selectStatus = 'something';
      const serviceRecipients = undefined;
      const selectedRecipients = undefined;
      expect(getSelectStatus(
        { selectStatus, serviceRecipients, selectedRecipients },
      )).toEqual(selectStatus);
    });

    it('if selectStatus is undefined, and serviceRecipients and'
      + ' selectedRecipients are equal length, it returns select', async () => {
      const serviceRecipients = [[1], [2]];
      const selectedRecipients = [[1], [2]];
      const selectStatus = undefined;
      expect(getSelectStatus(
        { selectStatus, serviceRecipients, selectedRecipients },
      )).toEqual('select');
    });

    it('if selectStatus is undefined, and serviceRecipients and selectedRecipients'
      + ' are not equal length, it returns false', async () => {
      const serviceRecipients = [[1], [2]];
      const selectedRecipients = [[1]];
      const selectStatus = undefined;
      expect(getSelectStatus(
        { selectStatus, serviceRecipients, selectedRecipients },
      )).toEqual(false);
    });
  });
});

import { fakeSessionManager } from 'buying-catalogue-library';
import { baseUrl } from '../../../../../config';
import * as contextCreator from './contextCreator';
import {
  getAdditionalServicesPageContext, getBackLinkHref,
  updateContext, updateContextPost,
} from './controller';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/routes/getOrderDescription';
import { logger } from '../../../../../logger';

jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  backLinkHref: jest.fn(),
  deleteButtonLink: jest.fn(),
  editRecipientsLink: jest.fn(),
  getContext: jest.fn(),
}));
jest.mock('../../../../../helpers/api/ordapi/getOrderItems');
jest.mock('../../../../../helpers/routes/getOrderDescription');

const accessToken = 'access_token';
const orderId = 'order-id';
const req = { headers: {}, params: { orderId }, query: {} };
const catalogueItemType = 'AdditionalService';
const selectedPrice = { type: 'Flat', provisioningType: 'Patient' };

describe('additional-services controller', () => {
  describe('getAdditionalServicesPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItems with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({
        req,
        orderId,
        catalogueItemType,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });

      expect(getOrderItems.mock.calls.length).toEqual(1);
      expect(getOrderItems).toHaveBeenCalledWith({
        orderId: 'order-id',
        catalogueItemType,
        accessToken,
      });
    });

    it('should call getOrderDescription with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({
        req,
        orderId,
        catalogueItemType,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });

      expect(getOrderDescription.mock.calls.length).toEqual(1);
      expect(getOrderDescription).toHaveBeenCalledWith({
        req,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });
    });

    it('should call getContext with the correct params', async () => {
      const orderDescription = 'some order';

      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce(orderDescription);
      contextCreator.getContext.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({
        req,
        orderId,
        catalogueItemType,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId,
        orderDescription,
        orderItems: [],
      });
    });
  });
});

describe('getBackLinkHref', () => {
  it('should return result from backLinkHref', () => {
    const expected = 'http://some.link.com';
    contextCreator.backLinkHref.mockReturnValueOnce(expected);

    const actual = getBackLinkHref(req, selectedPrice, orderId);

    expect(contextCreator.backLinkHref.mock.calls.length).toEqual(1);
    expect(contextCreator.backLinkHref).toHaveBeenCalledWith({ req, selectedPrice, orderId });
    expect(actual).toEqual(expected);
  });
});

describe('updateContext', () => {
  const context = {
    deleteButton: {
      altText: 'The Delete Catalogue Solution button will be disabled until you save for the first time',
      text: 'Delete Catalogue Solution',
    },
    editButton: {},
    backLinkHref: `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price/recipients/date`,
  };
  const expected = 'http://some.link.com';
  const orderItemId = 'order-item-Id';

  it('should set expected backLinkHref if no submitted query param', () => {
    contextCreator.backLinkHref.mockReturnValueOnce(expected);

    updateContext(req, selectedPrice, context, orderId, orderItemId);

    expect(contextCreator.backLinkHref).toHaveBeenCalledWith({ req, selectedPrice, orderId });
    expect(context.backLinkHref).toEqual(expected);
  });

  it('should set backLinkHref to additional-services if valid submitted query param', () => {
    req.query.submitted = 'order-item-81';

    updateContext(req, selectedPrice, context, orderId, orderItemId);

    expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/additional-services`);
  });

  it('should set expected deleteButton alt text', () => {
    const expectedAltText = context.deleteButton.altText.replace('Catalogue Solution', 'Additional Service');

    updateContext(req, selectedPrice, context, orderId, orderItemId);

    expect(context.deleteButton.altText).toEqual(expectedAltText);
  });

  it('should set expected deleteButton link', () => {
    contextCreator.deleteButtonLink.mockReturnValueOnce(expected);

    updateContext(req, selectedPrice, context, orderId, orderItemId);

    expect(context.deleteButton.href).toEqual(expected);
  });

  it('should set expected deleteButton text', () => {
    const expectedText = context.deleteButton.text.replace('Catalogue Solution', 'Additional Service');

    updateContext(req, selectedPrice, context, orderId, orderItemId);

    expect(context.deleteButton.text).toEqual(expectedText);
  });

  it('should set expected editButton link', () => {
    contextCreator.editRecipientsLink.mockReturnValueOnce(expected);

    updateContext(req, selectedPrice, context, orderId, orderItemId);

    expect(context.editButton.href).toEqual(expected);
  });

  it('should set price data to 0.00 if set to 0', () => {
    context.questions = {
      price: {
        data: 0,
      },
    };

    updateContext(req, selectedPrice, context, orderId, orderItemId);

    expect(context.questions.price.data).toEqual('0.00');
  });

  it('should not change price data if not set to 0', () => {
    context.questions = {
      price: {
        data: 4.5,
      },
    };

    updateContext(req, selectedPrice, context, orderId, orderItemId);

    expect(context.questions.price.data).toEqual(4.5);
  });
});

describe('updateContextPost', () => {
  const context = {
    deleteButton: {
      altText: 'The Delete Catalogue Solution button will be disabled until you save for the first time',
      text: 'Delete Catalogue Solution',
    },
    editButton: {},
    backLinkHref: `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price/recipients/date`,
  };
  const orderItemId = 'order-item-Id';
  const additionalServicesUrl = `${baseUrl}/organisation/${orderId}/additional-services`;
  const expected = 'http://some.link.com';

  it('should set expected backLinkHref to additional-services if no referer', () => {
    updateContextPost(req, selectedPrice, context, orderId, orderItemId);

    expect(context.backLinkHref).toEqual(additionalServicesUrl);
  });

  it('should set expected backLinkHref to additional-services if not new order item', () => {
    req.headers.referer = 'https://someorg.com/order/organisation/C010000-01/additional/A390';

    updateContextPost(req, selectedPrice, context, orderId, orderItemId);

    expect(context.backLinkHref).toEqual(additionalServicesUrl);
  });

  it('should set expected backLinkHref to date URL if new order item', () => {
    const dateUrl = `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price/recipients/date`;
    contextCreator.backLinkHref.mockReturnValueOnce(dateUrl);

    req.headers.referer = `https://someorg.com/order/organisation/${orderId}/additional/newOrderItem`;

    updateContextPost(req, selectedPrice, context, orderId, orderItemId);

    expect(contextCreator.backLinkHref).toHaveBeenCalledWith({ req, selectedPrice, orderId });
    expect(context.backLinkHref).toEqual(dateUrl);
  });

  it('should set expected deleteButton alt text', () => {
    const expectedAltText = context.deleteButton.altText.replace('Catalogue Solution', 'Additional Service');

    updateContextPost(req, selectedPrice, context, orderId, orderItemId);

    expect(context.deleteButton.altText).toEqual(expectedAltText);
  });

  it('should set expected deleteButton link', () => {
    contextCreator.deleteButtonLink.mockReturnValueOnce(expected);

    updateContextPost(req, selectedPrice, context, orderId, orderItemId);

    expect(context.deleteButton.href).toEqual(expected);
  });

  it('should set expected deleteButton text', () => {
    const expectedText = context.deleteButton.text.replace('Catalogue Solution', 'Additional Service');

    updateContextPost(req, selectedPrice, context, orderId, orderItemId);

    expect(context.deleteButton.text).toEqual(expectedText);
  });

  it('should set expected editButton link', () => {
    contextCreator.editRecipientsLink.mockReturnValueOnce(expected);

    updateContextPost(req, selectedPrice, context, orderId, orderItemId);

    expect(contextCreator.editRecipientsLink).toHaveBeenCalledWith(orderId);
    expect(context.editButton.href).toEqual(expected);
  });
});

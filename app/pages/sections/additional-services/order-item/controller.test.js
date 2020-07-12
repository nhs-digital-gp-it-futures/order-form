import { postData, putData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import {
  getOrderItemContext,
  saveSolutionOrderItem,
} from './controller';
import * as contextCreator from './contextCreator';
import * as getSelectedPriceManifest from '../../../../helpers/controllers/manifestProvider';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

jest.mock('./commonManifest.json', () => ({ title: 'fake manifest' }));

jest.mock('../../../../helpers/controllers/manifestProvider', () => ({
  getSelectedPriceManifest: jest.fn(),
}));

const selectedPrice = {
  priceId: 1,
  provisioningType: 'OnDemand',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.1,
};

const orderItemType = 'catalogue-solutions';

describe('catalogue-solutions order-item controller', () => {
  describe('getOrderItemContext', () => {
    afterEach(() => {
      contextCreator.getContext.mockReset();
      getSelectedPriceManifest.getSelectedPriceManifest.mockReset();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      await getOrderItemContext({
        orderId: 'order-1',
        orderItemType,
        solutionName: 'solution-name',
        selectedRecipientId: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        selectedPriceId: 'some-price-id',
        selectedPrice,
      });

      expect(getSelectedPriceManifest.getSelectedPriceManifest.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.getSelectedPriceManifest).toHaveBeenCalledWith({
        orderItemType,
        provisioningType: selectedPrice.provisioningType,
        type: selectedPrice.type,
      });
    });

    it('should call getContext with the correct params', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      await getOrderItemContext({
        orderId: 'order-1',
        solutionName: 'solution-name',
        odsCode: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        selectedPriceId: 'some-price-id',
        selectedPrice,
        formData: { price: 0.1 },
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        odsCode: 'fake-recipient-id',
        orderId: 'order-1',
        serviceRecipientName: 'Some service recipient 1',
        solutionName: 'solution-name',
        selectedPrice,
        formData: { price: 0.1 },
      });
    });

    it('should call getContext with the correct params when formData passed in', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      const formData = {
        'deliveryDate-year': '2020',
        'deliveryDate-month': '04',
        'deliveryDate-day': '27',
        quantity: 3,
        selectEstimationPeriod: 'month',
        price: 0.1,
      };

      await getOrderItemContext({
        orderId: 'order-1',
        solutionName: 'solution-name',
        odsCode: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        selectedPriceId: 'some-price-id',
        selectedPrice,
        formData,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        odsCode: 'fake-recipient-id',
        orderId: 'order-1',
        serviceRecipientName: 'Some service recipient 1',
        solutionName: 'solution-name',
        selectedPrice,
        formData,
      });
    });
  });

  describe('saveSolutionOrderItem', () => {
    describe('when order item is new', () => {
      afterEach(() => {
        postData.mockReset();
      });

      const serviceRecipient = { name: 'Recipient 1', odsCode: 'ods1' };
      const solution = { id: 'solutionId1', name: 'Solution 1' };
      const formData = {
        _csrf: 'E4xB4klq-hLgMvQGHZxQhrHUhh6gSaLz5su8',
        'deliveryDate-day': '25',
        'deliveryDate-month': '12',
        'deliveryDate-year': '2020',
        price: '500.49',
        quantity: '1',
        selectEstimationPeriod: 'month',
      };

      describe('with errors', () => {
        it('should return error.response if api request is unsuccessful with 400', async () => {
          const responseData = { errors: [{}] };
          postData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

          const response = await saveSolutionOrderItem({
            orderId: 'order1',
            orderItemId: 'neworderitem',
            accessToken: 'access_token',
            selectedRecipientId: serviceRecipient.odsCode,
            serviceRecipientName: serviceRecipient.name,
            selectedSolutionId: solution.id,
            solutionName: solution.name,
            selectedPrice,
            formData,
          });

          expect(response).toEqual(responseData);
        });

        it('should throw an error if api request is unsuccessful with non 400', async () => {
          postData.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

          try {
            await saveSolutionOrderItem({
              orderId: 'order1',
              orderItemId: 'neworderitem',
              accessToken: 'access_token',
              selectedRecipientId: serviceRecipient.odsCode,
              serviceRecipientName: serviceRecipient.name,
              selectedSolutionId: solution.id,
              solutionName: solution.name,
              selectedPrice,
              formData,
            });
          } catch (err) {
            expect(err).toEqual(new Error());
          }
        });
      });

      describe('with no errors', () => {
        it('should post correctly formatted data', async () => {
          postData.mockResolvedValueOnce({ data: { orderId: 'order1' } });

          await saveSolutionOrderItem({
            orderId: 'order1',
            orderItemId: 'neworderitem',
            accessToken: 'access_token',
            selectedRecipientId: serviceRecipient.odsCode,
            serviceRecipientName: serviceRecipient.name,
            selectedSolutionId: solution.id,
            solutionName: solution.name,
            selectedPrice,
            formData,
          });

          expect(postData.mock.calls.length).toEqual(1);
          expect(postData).toHaveBeenCalledWith({
            endpoint: `${orderApiUrl}/api/v1/orders/order1/sections/catalogue-solutions`,
            body: {
              ...selectedPrice,
              serviceRecipient,
              catalogueSolutionId: 'solutionId1',
              catalogueSolutionName: 'Solution 1',
              deliveryDate: '2020-12-25',
              quantity: 1,
              estimationPeriod: 'month',
              price: 500.49,
            },
            accessToken: 'access_token',
            logger,
          });
        });

        it('should return success as true if data is saved successfully', async () => {
          postData.mockResolvedValueOnce({ success: true });

          const response = await saveSolutionOrderItem({
            orderId: 'order1',
            orderItemId: 'neworderitem',
            accessToken: 'access_token',
            selectedRecipientId: serviceRecipient.odsCode,
            serviceRecipientName: serviceRecipient.name,
            selectedSolutionId: solution.id,
            solutionName: solution.name,
            selectedPrice,
            formData,
          });

          expect(response.success).toEqual(true);
          expect(response.errors).toEqual(undefined);
        });
      });
    });

    describe('when order item is existing', () => {
      afterEach(() => {
        putData.mockReset();
      });

      const formData = {
        _csrf: 'E4xB4klq-hLgMvQGHZxQhrHUhh6gSaLz5su8',
        'deliveryDate-day': '25',
        'deliveryDate-month': '12',
        'deliveryDate-year': '2020',
        price: '500.49',
        quantity: '1',
        selectEstimationPeriod: 'month',
      };

      describe('with errors', () => {
        it('should return error.respose if api request is unsuccessful with 400', async () => {
          const responseData = { errors: [{}] };
          putData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

          const response = await saveSolutionOrderItem({
            orderId: 'order1',
            orderItemId: 'orderItemId-1',
            accessToken: 'access_token',
            formData,
          });

          expect(response).toEqual(responseData);
        });

        it('should throw an error if api request is unsuccessful with non 400', async () => {
          putData.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

          try {
            await saveSolutionOrderItem({
              orderId: 'order1',
              orderItemId: 'orderItemId-1',
              accessToken: 'access_token',
              formData,
            });
          } catch (err) {
            expect(err).toEqual(new Error());
          }
        });
      });

      describe('with no errors', () => {
        it('should post correctly formatted data', async () => {
          putData.mockResolvedValueOnce({ data: { orderId: 'order1' } });

          await saveSolutionOrderItem({
            orderId: 'order1',
            orderItemId: 'orderItemId-1',
            accessToken: 'access_token',
            formData,
          });

          expect(putData.mock.calls.length).toEqual(1);
          expect(putData).toHaveBeenCalledWith({
            endpoint: `${orderApiUrl}/api/v1/orders/order1/sections/catalogue-solutions/orderItemId-1`,
            body: {
              deliveryDate: '2020-12-25',
              quantity: 1,
              estimationPeriod: 'month',
              price: 500.49,
            },
            accessToken: 'access_token',
            logger,
          });
        });

        it('should return success as true if data is saved successfully', async () => {
          putData.mockResolvedValueOnce({ success: true });

          const response = await saveSolutionOrderItem({
            orderId: 'order1',
            orderItemId: 'orderItemId-1',
            accessToken: 'access_token',
            formData,
          });

          expect(response.success).toEqual(true);
          expect(response.errors).toEqual(undefined);
        });
      });
    });
  });
});

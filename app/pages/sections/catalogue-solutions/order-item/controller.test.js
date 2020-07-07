import { getData, postData } from 'buying-catalogue-library';
import { solutionsApiUrl, organisationApiUrl, orderApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import {
  getOrderItem,
  getRecipientName,
  getSelectedPrice,
  getOrderItemContext,
  validateOrderItemForm,
  postSolutionOrderItem,
} from './controller';
import * as contextCreator from './contextCreator';
import * as getSelectedPriceManifest from './manifestProvider';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

jest.mock('./commonManifest.json', () => ({ title: 'fake manifest' }));

jest.mock('./manifestProvider', () => ({
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

describe('catalogue-solutions order-item controller', () => {
  describe('getOrderItemContext', () => {
    afterEach(() => {
      contextCreator.getContext.mockReset();
      getSelectedPriceManifest.getSelectedPriceManifest.mockReset();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      await getOrderItemContext({
        orderId: 'order-1',
        solutionName: 'solution-name',
        selectedRecipientId: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        selectedPriceId: 'some-price-id',
        selectedPrice,
      });

      expect(getSelectedPriceManifest.getSelectedPriceManifest.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.getSelectedPriceManifest).toHaveBeenCalledWith({
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
        selectedRecipientId: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        selectedPriceId: 'some-price-id',
        selectedPrice,
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
  });

  describe('getCatalogueOrderItem', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: {} });

      await getOrderItem({ orderId: 'order-1', orderItemId: 'order-item-1', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-1/sections/catalogue-solutions/order-item-1`,
        accessToken: 'access_token',
        logger,
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

  describe('validateOrderItemForm', () => {
    describe('when there are no validation errors', () => {
      it('should return an empty array', () => {
        const selectedPriceManifest = { questions: {}, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {
          quantity: '1',
          price: '1',
          selectEstimationPeriod: 'perMonth',
          'deliveryDate-day': '09',
          'deliveryDate-month': '02',
          'deliveryDate-year': '2021',
        };

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual([]);
      });
    });

    describe('when there are validation errors', () => {
      const quantityRequired = {
        field: 'Quantity',
        id: 'QuantityRequired',
      };
      const quantityMustBeANumber = {
        field: 'Quantity',
        id: 'QuantityMustBeANumber',
      };
      const quantityInvalid = {
        field: 'Quantity',
        id: 'QuantityInvalid',
      };
      const estimationPeriodRequired = {
        field: 'SelectEstimationPeriod',
        id: 'EstimationPeriodRequired',
      };
      const priceRequired = {
        field: 'Price',
        id: 'PriceRequired',
      };
      const priceMustBeANumber = {
        field: 'Price',
        id: 'PriceMustBeANumber',
      };
      const priceMoreThan3dp = {
        field: 'Price',
        id: 'PriceMoreThan3dp',
      };
      const deliveryDateRequired = {
        field: 'DeliveryDate',
        id: 'DeliveryDateRequired',
        part: ['day', 'month', 'year'],
      };

      it('should return an array of one validation error if an empty string for quantity is passed in', () => {
        const selectedPriceManifest = { questions: { quantity: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {
          quantity: '',
          price: '1.5',
          selectEstimationPeriod: 'perMonth',
          'deliveryDate-day': '09',
          'deliveryDate-month': '02',
          'deliveryDate-year': '2021',
        };

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual([quantityRequired]);
      });

      it('should return an array of one validation error if quantity is not a number', () => {
        const selectedPriceManifest = { questions: { quantity: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {
          quantity: 'not a number',
          price: '1.5',
          selectEstimationPeriod: 'perMonth',
          'deliveryDate-day': '09',
          'deliveryDate-month': '02',
          'deliveryDate-year': '2021',
        };

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual([quantityMustBeANumber]);
      });

      it('should return an array of one validation error if quantity is invalid', () => {
        const selectedPriceManifest = { questions: { quantity: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {
          quantity: '1.1',
          price: '1.5',
          selectEstimationPeriod: 'perMonth',
          'deliveryDate-day': '09',
          'deliveryDate-month': '02',
          'deliveryDate-year': '2021',
        };

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual([quantityInvalid]);
      });

      it('should return an array of one validation error if an estimation period is not selected', () => {
        const selectedPriceManifest = { questions: { selectEstimationPeriod: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {
          quantity: '1',
          price: '1.5',
          'deliveryDate-day': '09',
          'deliveryDate-month': '02',
          'deliveryDate-year': '2021',
        };

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual([estimationPeriodRequired]);
      });

      it('should return an array of one validation error if empty string for price is passed in', () => {
        const selectedPriceManifest = { questions: {}, addPriceTable: { cellInfo: { price: { question: 'test' } } } };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {
          quantity: '1',
          price: '',
          selectEstimationPeriod: 'perMonth',
          'deliveryDate-day': '09',
          'deliveryDate-month': '02',
          'deliveryDate-year': '2021',
        };

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual([priceRequired]);
      });

      it('should return an array of one validation error if price is not a number', () => {
        const selectedPriceManifest = { questions: {}, addPriceTable: { cellInfo: { price: { question: 'test' } } } };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {
          quantity: '1',
          price: 'not a number',
          selectEstimationPeriod: 'perMonth',
          'deliveryDate-day': '09',
          'deliveryDate-month': '02',
          'deliveryDate-year': '2021',
        };

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual([priceMustBeANumber]);
      });

      it('should return an array of one validation error if price has more than 3dp', () => {
        const selectedPriceManifest = { questions: {}, addPriceTable: { cellInfo: { price: { question: 'test' } } } };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {
          quantity: '1',
          price: '1.1234',
          selectEstimationPeriod: 'perMonth',
          'deliveryDate-day': '09',
          'deliveryDate-month': '02',
          'deliveryDate-year': '2021',
        };

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual([priceMoreThan3dp]);
      });

      it('should return an array of one validation error  if deliveryDate is not valid', () => {
        const selectedPriceManifest = { questions: { deliveryDate: 'test' }, addPriceTable: { cellInfo: { price: 'fakePrice' } } };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {
          quantity: '1',
          price: '1.5',
          selectEstimationPeriod: 'perMonth',
          'deliveryDate-day': '',
          'deliveryDate-month': '',
          'deliveryDate-year': '',
        };

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual([deliveryDateRequired]);
      });

      it('should return a validation error if all values are undefined', () => {
        const selectedPriceManifest = {
          questions: {
            deliveryDate: 'test', quantity: 'test', selectEstimationPeriod: 'test',
          },
          addPriceTable: { cellInfo: { price: { question: 'test' } } },
        };
        getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);
        const data = {};

        const errors = validateOrderItemForm({ data, selectedPrice });

        expect(errors).toEqual(
          [deliveryDateRequired, quantityRequired, estimationPeriodRequired, priceRequired],
        );
      });
    });
  });

  describe('postSolutionOrderItem', () => {
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
      selectEstimationPeriod: 'perMonth',
    };

    describe('with errors', () => {
      it('should return error.respose if api request is unsuccessful with 400', async () => {
        const responseData = { errors: [{}] };
        postData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

        const response = await postSolutionOrderItem({
          orderId: 'order1',
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
          await postSolutionOrderItem({
            orderId: 'order1',
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

        await postSolutionOrderItem({
          orderId: 'order1',
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
            serviceRecipient,
            catalogueSolutionId: 'solutionId1',
            catalogueSolutionName: 'Solution 1',
            deliveryDate: '2020-12-25',
            quantity: 1,
            estimationPeriod: 'perMonth',
            provisioningType: 'OnDemand',
            type: 'flat',
            currencyCode: 'GBP',
            itemUnitModel: selectedPrice.itemUnit,
            price: 500.49,
          },
          accessToken: 'access_token',
          logger,
        });
      });

      it('should return success as true if data is saved successfully', async () => {
        postData.mockResolvedValueOnce({ success: true });

        const response = await postSolutionOrderItem({
          orderId: 'order1',
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
});

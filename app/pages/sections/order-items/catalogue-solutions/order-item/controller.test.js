import { sessionManager } from 'buying-catalogue-library/lib/middleware/sessionManager';
import {
  getOrderItemContext, getOrderItemErrorContext, getPageData, setEstimationPeriod,
} from './controller';
import * as contextCreator from './contextCreator';
import * as getSelectedPriceManifest from '../../../../../helpers/controllers/manifestProvider';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

jest.mock('./contextCreator', () => ({ getContext: jest.fn(), getErrorContext: jest.fn() }));
jest.mock('./commonManifest.json', () => ({ title: 'fake manifest' }));

jest.mock('../../../../../helpers/controllers/manifestProvider', () => ({
  getSelectedPriceManifest: jest.fn(),
  modifyManifestIfOnDemand: jest.fn(),
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
      jest.resetAllMocks();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      const mockSelectedPrice = {
        provisioningType: 'Patient',
        type: 'flat',
      };
      await getOrderItemContext({
        orderId: 'order-1',
        orderItemType,
        solutionName: 'solution-name',
        selectedRecipientId: 'fake-recipient-id',
        selectedPriceId: 'some-price-id',
        selectedPrice: mockSelectedPrice,
        formData: {
          selectEstimationPeriod: 'month',
        },
      });

      expect(getSelectedPriceManifest.getSelectedPriceManifest.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.getSelectedPriceManifest).toHaveBeenCalledWith({
        orderItemType,
        provisioningType: mockSelectedPrice.provisioningType,
        type: mockSelectedPrice.type,
      });
    });

    it('should call getContext with the correct params when formData passed in', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      const mockSelectedPrice = {
        provisioningType: 'Patient',
        type: 'flat',
      };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      const formData = {
        deliveryDate: {
          day: 9,
          month: 2,
          year: 2021,
        },
        price: 0.1,
      };
      const recipients = [{}];

      await getOrderItemContext({
        orderId: 'order-1',
        solutionName: 'solution-name',
        selectedPriceId: 'some-price-id',
        orderItemId: 'order-item-id',
        selectedPrice: mockSelectedPrice,
        formData,
        recipients,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        orderId: 'order-1',
        solutionName: 'solution-name',
        orderItemId: 'order-item-id',
        formData,
        recipients,
        selectedPrice: mockSelectedPrice,
      });
    });
  });

  describe('getOrderItemErrorContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getSelectedPriceManifest with the correct params', async () => {
      const formData = { selectEstimationPeriod: 'year' };
      const params = {
        formData,
        orderItemType,
        selectedPrice,
      };

      await getOrderItemErrorContext(params);

      expect(getSelectedPriceManifest.getSelectedPriceManifest.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.getSelectedPriceManifest).toHaveBeenCalledWith({
        orderItemType,
        provisioningType: selectedPrice.provisioningType,
        type: selectedPrice.type,
      });
    });

    it('should call modifyManifestIfOnDemand with the correct params', async () => {
      const formData = { selectEstimationPeriod: 'year' };
      const params = {
        formData,
        orderItemType,
        selectedPrice,
      };
      const mockSelectedPriceManifest = jest.fn();
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(mockSelectedPriceManifest);

      await getOrderItemErrorContext(params);

      expect(getSelectedPriceManifest.modifyManifestIfOnDemand.mock.calls.length).toEqual(1);
      expect(getSelectedPriceManifest.modifyManifestIfOnDemand).toHaveBeenCalledWith(
        params.selectedPrice,
        mockSelectedPriceManifest,
        params.formData.selectEstimationPeriod,
      );
    });

    it('should call getContext with the correct params when formData passed in', async () => {
      const selectedPriceManifest = { description: 'fake manifest' };
      getSelectedPriceManifest.getSelectedPriceManifest.mockReturnValue(selectedPriceManifest);

      const formData = {
        deliveryDate: {
          day: 9,
          month: 2,
          year: 2021,
        },
        price: 0.1,
      };

      const params = {
        orderItemType,
        selectedPrice,
        formData,
      };

      await getOrderItemErrorContext(params);

      expect(contextCreator.getErrorContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getErrorContext).toHaveBeenCalledWith({
        ...params,
        commonManifest: { title: 'fake manifest' },
        selectedPriceManifest,
        formData,
      });
    });
  });

  describe('getPageData', () => {
    const estimationPeriod = 'some-time-period';
    const req = {};

    it('should set timeUnit on selectedPrice if estimationPeriod in session data', async () => {
      const pageData = { selectedPrice: {} };
      // eslint-disable-next-line no-unused-vars
      sessionManager.getFromSession = jest.fn(({ _, key }) => {
        if (key === sessionKeys.orderItemPageData) {
          return pageData;
        }
        return estimationPeriod;
      });

      const actual = getPageData(req, sessionManager);

      expect(actual.selectedPrice.timeUnit.name).toEqual(estimationPeriod);
      expect(actual.selectedPrice.timeUnit.description).toEqual(`per ${estimationPeriod}`);
    });

    it('should not set timeUnit on selectedPrice if estimationPeriod not in session data', async () => {
      const pageData = { selectedPrice: {} };
      // eslint-disable-next-line no-unused-vars
      sessionManager.getFromSession = jest.fn(({ _, key }) => {
        if (key === sessionKeys.orderItemPageData) {
          return pageData;
        }
        return null;
      });

      const actual = getPageData(req, sessionManager);

      expect(actual.selectedPrice.timeUnit).toEqual(undefined);
    });
  });
});

describe('setEstimationPeriod', () => {
  const estimationPeriod = 'some-time-period';
  const req = {};
  const formData = {};

  it('should set estimation period on formData if in session data', () => {
    // eslint-disable-next-line no-unused-vars
    sessionManager.getFromSession = () => estimationPeriod;

    setEstimationPeriod(req, formData, sessionManager);

    expect(formData.selectEstimationPeriod).toEqual(estimationPeriod);
  });

  it('should not set estimation period on formData if in session data', () => {
    // eslint-disable-next-line no-unused-vars
    sessionManager.getFromSession = jest.fn();
    const otherValue = 'other-time-frame';
    formData.selectEstimationPeriod = otherValue;

    setEstimationPeriod(req, formData, sessionManager);

    expect(sessionManager.getFromSession).toHaveBeenCalledWith({
      req,
      key: sessionKeys.selectEstimationPeriod,
    });
    expect(formData.selectEstimationPeriod).toEqual(otherValue);
  });
});

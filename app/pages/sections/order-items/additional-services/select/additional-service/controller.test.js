import { getData, fakeSessionManager } from 'buying-catalogue-library';
import {
  solutionsApiUrl as bapiUrl,
  orderApiUrl,
} from '../../../../../../config';
import { logger } from '../../../../../../logger';
import {
  getAdditionalServicePageContext,
  getAdditionalServiceErrorPageContext,
  findAdditionalServices,
  findAddedCatalogueSolutions,
  findSelectedCatalogueItemInSession,
  validateAdditionalServicesForm,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
  getErrorContext: jest.fn(),
}));

describe('additional-services select-additional-service controller', () => {
  describe('getAdditionalServicePageContext', () => {
    it('should call getContext with the correct params', () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      getAdditionalServicePageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });

  describe('getAdditionalServiceErrorPageContext', () => {
    it('should call getErrorContext with the correct params', async () => {
      contextCreator.getErrorContext
        .mockResolvedValueOnce();

      const params = {
        orderId: 'order-1',
        additionalServices: [{ additionalServiceId: 'additional-service-1' }],
      };

      getAdditionalServiceErrorPageContext(params);

      expect(contextCreator.getErrorContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getErrorContext).toHaveBeenCalledWith(params);
    });
  });

  describe('findAdditionalServices', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ additionalServices: [] });

      const addedCatalogueSolutions = ['1', '2', '3'];
      await findAdditionalServices({ addedCatalogueSolutions, accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${bapiUrl}/api/v1/additional-services?solutionIds=1&solutionIds=2&solutionIds=3`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return empty list when getData returns undefined', async () => {
      getData
        .mockResolvedValueOnce({ additionalServices: undefined });

      const addedCatalogueSolutions = ['1', '2', '3'];
      const expected = await findAdditionalServices({ addedCatalogueSolutions, accessToken: 'access_token' });
      expect(expected).toEqual([]);
    });

    it('should return expected list when addedCatalogueSolutions is an empty array', async () => {
      const additionalServices = [
        {
          additionalServiceId: 'additional-service-1',
          name: 'Additional Service 1',
        },
      ];

      getData
        .mockResolvedValueOnce({ additionalServices });

      const addedCatalogueSolutions = [];
      const expected = await findAdditionalServices({ addedCatalogueSolutions, accessToken: 'access_token' });
      expect(expected).toEqual(additionalServices);
    });
  });

  describe('findAddedCatalogueSolutions', () => {
    afterEach(() => {
      getData.mockReset();
    });

    const orderId = 'order-id';

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ catalogueSolutions: [] });

      await findAddedCatalogueSolutions({ orderId, accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/${orderId}/sections/catalogue-solutions`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return a list of catalogue item ids', async () => {
      getData
        .mockResolvedValueOnce({
          catalogueSolutions: [
            {
              catalogueItemId: 'some catalogue item id',
              catalogueItemName: 'some catalogue item name',
            },
          ],
        });

      const catalogueItemIds = await findAddedCatalogueSolutions({ orderId, accessToken: 'access_token' });
      expect(catalogueItemIds).toEqual(['some catalogue item id']);
    });

    it('should return empty list when getData returns undefined', async () => {
      getData
        .mockResolvedValueOnce({ catalogueSolutions: undefined });

      const catalogueItemIds = await findAddedCatalogueSolutions({ orderId, accessToken: 'access_token' });
      expect(catalogueItemIds).toEqual([]);
    });
  });

  describe('findSelectedCatalogueItemInSession', () => {
    it('should throw an error when an additional service cannot be found in session', () => {
      expect(() => findSelectedCatalogueItemInSession({ sessionManager: fakeSessionManager }))
        .toThrow(Error);
    });
  });

  describe('validateAdditionalServicesForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          selectAdditionalService: 'some-additional-service-id',
        };

        const response = validateAdditionalServicesForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const expectedValidationErrors = [
        {
          field: 'selectAdditionalService',
          id: 'SelectAdditionalServiceRequired',
        },
      ];

      it('should return an array of one validation error and success as false if empty string is passed in', () => {
        const data = {
          selectAdditionalService: '',
        };

        const response = validateAdditionalServicesForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return an array of one validation error and success as false if whitespace only is passed in', () => {
        const data = {
          selectAdditionalService: '   ',
        };

        const response = validateAdditionalServicesForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if selectAdditionalService is undefined', () => {
        const data = {};

        const response = validateAdditionalServicesForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });
});

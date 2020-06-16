import { getData } from 'buying-catalogue-library';
import { solutionsApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import * as contextCreator from './contextCreator';
import {
  getSupplierSearchPageContext, validateSupplierSearchForm, findSuppliers,
} from './controller';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('supplier search controller', () => {
  describe('getSupplierSearchPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getSupplierSearchPageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });

  describe('validateSupplierSearchForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          supplierName: 'some supplier name',
        };

        const response = validateSupplierSearchForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const expectedValidationErrors = [
        {
          field: 'supplierName',
          id: 'SupplierNameRequired',
        },
      ];

      it('should return an array of one validation error and success as false', () => {
        const data = {
          supplierName: '',
        };

        const response = validateSupplierSearchForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if supplierName just contains blank spaces', () => {
        const data = {
          supplierName: '  ',
        };

        const response = validateSupplierSearchForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if supplierName is undefined', () => {
        const data = {};

        const response = validateSupplierSearchForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });

  describe('findSuppliers', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: [] });

      await findSuppliers({ name: 'some-supp', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/suppliers?name=some-supp&solutionPublicationStatus=Published`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should encode search term in the url', async () => {
      getData
        .mockResolvedValueOnce({ data: [] });

      await findSuppliers({ name: '&', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/suppliers?name=%26&solutionPublicationStatus=Published`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should encode the endpoint called to find suppliers', async () => {
      getData
        .mockResolvedValueOnce({ data: [] });

      await findSuppliers({ name: '%', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/suppliers?name=%25&solutionPublicationStatus=Published`,
        accessToken: 'access_token',
        logger,
      });
    });
  });
});

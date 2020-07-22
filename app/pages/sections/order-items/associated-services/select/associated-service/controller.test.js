import { fakeSessionManager } from 'buying-catalogue-library';
import {
  getAssociatedServicePageContext,
  getAssociatedServiceErrorPageContext,
  findAssociatedServices,
  validateAssociatedServicesForm,
} from './controller';
import { logger } from '../../../../../../logger';
import * as contextCreator from './contextCreator';
import * as getCatalogueItems from '../../../../../../helpers/api/bapi/getCatalogueItems';
import * as getSupplier from '../../../../../../helpers/api/ordapi/getSupplier';

jest.mock('buying-catalogue-library');
jest.mock('../../../../../../logger');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
  getErrorContext: jest.fn(),
}));

jest.mock('./../../../../../../helpers/api/bapi/getCatalogueItems', () => ({
  getCatalogueItems: jest.fn(),
}));

jest.mock('./../../../../../../helpers/api/ordapi/getSupplier', () => ({
  getSupplier: jest.fn(),
}));

describe('associated-services select-associated-service controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAssociatedServicePageContext', () => {
    it('should call getContext with the correct params', () => {
      contextCreator.getContext.mockResolvedValueOnce();

      getAssociatedServicePageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });

  describe('getAssociatedServiceErrorPageContext', () => {
    it('should call getErrorContext with the correct params', async () => {
      contextCreator.getErrorContext
        .mockResolvedValueOnce();

      const params = {
        orderId: 'order-1',
        associatedServices: [{ associatedServiceId: 'associated-service-1' }],
      };

      getAssociatedServiceErrorPageContext(params);

      expect(contextCreator.getErrorContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getErrorContext).toHaveBeenCalledWith(params);
    });
  });

  describe('findAssociatedServices', () => {
    it('should call getSupplier with the correct params when supplier ID not in session', async () => {
      fakeSessionManager.getFromSession = () => undefined;
      fakeSessionManager.saveToSession = () => {};

      contextCreator.getContext.mockResolvedValueOnce();
      getCatalogueItems.getCatalogueItems.mockResolvedValueOnce();
      getSupplier.getSupplier.mockResolvedValueOnce({ supplierId: 'sup-1' });

      const orderId = 'order-1';
      const req = { params: { orderId } };
      const accessToken = 'access-token';

      await findAssociatedServices({
        req,
        sessionManager: fakeSessionManager,
        accessToken,
        logger,
      });

      expect(getSupplier.getSupplier.mock.calls.length).toEqual(1);
      expect(getSupplier.getSupplier).toHaveBeenCalledWith({ orderId, accessToken, logger });
    });

    it('should not call getSupplier when supplier ID is in session', async () => {
      fakeSessionManager.getFromSession = () => 'sup-1';
      fakeSessionManager.saveToSession = () => {};

      contextCreator.getContext.mockResolvedValueOnce();
      getCatalogueItems.getCatalogueItems.mockResolvedValueOnce();
      getSupplier.getSupplier.mockResolvedValueOnce();

      await findAssociatedServices({
        req: { params: { orderId: 'order-1' } },
        sessionManager: fakeSessionManager,
        accessToken: 'access-token',
        logger,
      });

      expect(getSupplier.getSupplier.mock.calls.length).toEqual(0);
    });

    it('should call getCatalogueItems with the correct params', async () => {
      const supplierId = 'sup-1';

      fakeSessionManager.getFromSession = () => supplierId;
      fakeSessionManager.saveToSession = () => {};

      contextCreator.getContext.mockResolvedValueOnce();
      getCatalogueItems.getCatalogueItems.mockResolvedValueOnce();
      getSupplier.getSupplier.mockResolvedValueOnce({ supplierId });

      await findAssociatedServices({
        req: { params: { orderId: 'order-1' } },
        sessionManager: fakeSessionManager,
        accessToken: 'access-token',
        logger,
      });

      expect(getCatalogueItems.getCatalogueItems.mock.calls.length).toEqual(1);
      expect(getCatalogueItems.getCatalogueItems).toHaveBeenCalledWith({ supplierId, catalogueItemType: 'AssociatedService' });
    });

    it('should return the expected result', async () => {
      fakeSessionManager.getFromSession = () => 'sup-1';
      fakeSessionManager.saveToSession = () => {};

      const expectedResult = { catalogueItems: ['item-1'] };

      contextCreator.getContext.mockResolvedValueOnce();
      getCatalogueItems.getCatalogueItems.mockResolvedValueOnce(expectedResult);
      getSupplier.getSupplier.mockResolvedValueOnce();

      const actualResult = await findAssociatedServices({
        req: { params: { orderId: 'order-1' } },
        sessionManager: fakeSessionManager,
        accessToken: 'access-token',
        logger,
      });

      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('validateAssociatedServicesForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          selectAssociatedService: 'some-associated-service-id',
        };

        const response = validateAssociatedServicesForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const expectedValidationErrors = [
        {
          field: 'selectAssociatedService',
          id: 'SelectAssociatedServiceRequired',
        },
      ];

      it('should return an array of one validation error and success as false if empty string is passed in', () => {
        const data = {
          selectAssociatedService: '',
        };

        const response = validateAssociatedServicesForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return an array of one validation error and success as false if whitespace only is passed in', () => {
        const data = {
          selectAssociatedService: '   ',
        };

        const response = validateAssociatedServicesForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if selectAssociatedService is undefined', () => {
        const data = {};

        const response = validateAssociatedServicesForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });
});

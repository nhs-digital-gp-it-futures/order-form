import { getData } from 'buying-catalogue-library';
import { orderApiUrl, solutionsApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import {
  getRecipientPageContext,
  getRecipients,
  getSolution,
  validateRecipientForm,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('catalogue-solutions select-solution controller', () => {
  describe('getRecipientPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getRecipientPageContext({ orderId: 'order-1', solutionName: 'Solution One' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1', solutionName: 'Solution One' });
    });
  });

  describe('getRecipients', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: {} });

      await getRecipients({ orderId: 'order-1', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-1/sections/service-recipients`,
        accessToken: 'access_token',
        logger,
      });
    });
  });

  describe('getSolution', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    const accessToken = 'access_token';
    const solutionId = 'sol-1';

    it('should call getData with the correct params when hasSavedData is true', async () => {
      getData.mockResolvedValueOnce({ supplierId: 'supp-1' });

      await getSolution({ solutionId, accessToken });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/solutions/${solutionId}`,
        accessToken,
        logger,
      });
    });
  });

  describe('validateRecipientForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          selectRecipient: 'some-recipient-id',
        };

        const response = validateRecipientForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const expectedValidationErrors = [
        {
          field: 'selectRecipient',
          id: 'SelectRecipientRequired',
        },
      ];

      it('should return an array of one validation error and success as false if empty string is passed in', () => {
        const data = {
          selectRecipient: '',
        };

        const response = validateRecipientForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return an array of one validation error and success as false if whitespace only is passed in', () => {
        const data = {
          selectRecipient: '   ',
        };

        const response = validateRecipientForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if supplierName is undefined', () => {
        const data = {};

        const response = validateRecipientForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });
});

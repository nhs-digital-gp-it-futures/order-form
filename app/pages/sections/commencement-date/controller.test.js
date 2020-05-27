import { getData, putData } from 'buying-catalogue-library';
import { getCommencementDateContext, putCommencementDate } from './controller';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';
import * as dateValidator from './getDateErrors';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');
jest.mock('./getDateErrors', () => ({
  getDateErrors: jest.fn(),
}));
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const mockData = {
  'commencementDate-day': '1',
  'commencementDate-month': '12',
  'commencementDate-year': '2020',
};

const mockDataError = {
  field: 'CommencementDate',
  part: ['day'],
  id: 'CommencementDateDayRequired',
};

describe('commencement-date controller', () => {
  describe('getCommencementDateContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('calls getData once with correct params', async () => {
      getData
        .mockResolvedValueOnce({});

      await getCommencementDateContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/commencement-date`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('calls getContext once with correct params if no data returned', async () => {
      getData
        .mockResolvedValueOnce({});
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getCommencementDateContext({ orderId: 'order-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id', data: undefined });
    });

    it('calls getContext once with correct params if data is returned', async () => {
      const commencementDate = '2020-1-1';
      getData
        .mockResolvedValueOnce({ commencementDate });
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getCommencementDateContext({ orderId: 'order-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id', data: commencementDate });
    });
  });

  describe('putCommencementDate', () => {
    afterEach(() => {
      dateValidator.getDateErrors.mockReset();
    });

    it('should call getDateErrors with the correct params', () => {
      putCommencementDate({
        orderId: 'order-id', data: mockData, accessToken: 'access_token',
      });

      expect(dateValidator.getDateErrors.mock.calls.length).toEqual(1);
      expect(dateValidator.getDateErrors).toHaveBeenCalledWith(mockData);
    });

    describe('with errors', () => {
      it('should return success as false if validation errors found', async () => {
        dateValidator.getDateErrors
          .mockReturnValueOnce(mockDataError);
        const response = await putCommencementDate({
          orderId: 'order-id', data: mockData, accessToken: 'access_token',
        });
        expect(response.success).toEqual(false);
        expect(response.errors.length).toEqual(1);
        expect(response.errors[0]).toEqual(mockDataError);
      });
    });

    describe('with no errors', () => {
      beforeEach(() => {
        putData.mockReset();
      });

      it('should call putData once with the correct params', async () => {
        dateValidator.getDateErrors
          .mockReturnValueOnce(null);
        putData
          .mockResolvedValueOnce({});

        await putCommencementDate({
          orderId: 'order-id', data: mockData, accessToken: 'access_token',
        });
        expect(putData.mock.calls.length).toEqual(1);
        expect(putData).toHaveBeenCalledWith({
          endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/commencement-date`,
          body: { commencementDate: '2020-12-1' },
          accessToken: 'access_token',
          logger,
        });
      });

      it('should return success as true if data is saved successfully', async () => {
        dateValidator.getDateErrors
          .mockReturnValueOnce(null);
        putData
          .mockResolvedValueOnce({});
        const response = await putCommencementDate({
          orderId: 'order-id', data: mockData, accessToken: 'access_token',
        });
        expect(response.success).toEqual(true);
        expect(response.errors).toEqual(undefined);
      });
    });
  });
});

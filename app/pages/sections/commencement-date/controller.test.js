import { putData } from 'buying-catalogue-library';
import { getCommencementDateContext, putCommencementDate, validateCommencementDateForm } from './controller';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';
import * as contextCreator from './contextCreator';
import { getCommencementDate } from '../../../helpers/api/ordapi/getCommencementDate';

jest.mock('buying-catalogue-library');
jest.mock('../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../helpers/api/ordapi/getCommencementDate');

const mockData = {
  'commencementDate-day': '21',
  'commencementDate-month': '12',
  'commencementDate-year': '2020',
};

describe('commencement-date controller', () => {
  describe('getCommencementDateContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls getCommencementDate once with correct params', async () => {
      getCommencementDate.mockResolvedValueOnce({});

      await getCommencementDateContext({ orderId: 'order-id', orgId: 'org-id', accessToken: 'access_token' });
      expect(getCommencementDate.mock.calls.length).toEqual(1);
      expect(getCommencementDate).toHaveBeenCalledWith({
        orderId: 'order-id',
        accessToken: 'access_token',
      });
    });

    it('calls getContext once with correct params if no data returned', async () => {
      getCommencementDate.mockResolvedValueOnce({});
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getCommencementDateContext({ orderId: 'order-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id', data: undefined });
    });

    it('calls getContext once with correct params if data is returned', async () => {
      const commencementDate = '2020-01-01';
      getCommencementDate.mockResolvedValueOnce({ commencementDate });
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getCommencementDateContext({ orderId: 'order-id', accessToken: 'access_token' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        data: {
          'commencementDate-day': '01',
          'commencementDate-month': '01',
          'commencementDate-year': '2020',
        },
      });
    });
  });

  describe('validateCommencementDateForm', () => {
    describe('when there are no validation errors', () => {
      it('should return an empty erray', () => {
        const data = {
          'commencementDate-day': '09',
          'commencementDate-month': '02',
          'commencementDate-year': '2021',
        };

        const errors = validateCommencementDateForm({ data });

        expect(errors).toEqual([]);
      });
    });

    describe('when there are validation errors', () => {
      const commencementDateRequired = {
        field: 'CommencementDate',
        id: 'CommencementDateRequired',
        part: ['day', 'month', 'year'],
      };

      it('should return an array of one validation error if deliveryDate is not valid', () => {
        const data = {
          'commencementDate-day': '',
          'commencementDate-month': '',
          'commencementDate-year': '',
        };

        const errors = validateCommencementDateForm({ data });

        expect(errors).toEqual([commencementDateRequired]);
      });
    });
  });

  describe('putCommencementDate', () => {
    describe('with errors', () => {
      it('should return error.respose.data if api request is unsuccessful with 400', async () => {
        const responseData = { errors: [{}] };
        putData
          .mockRejectedValueOnce({ response: { status: 400, data: responseData } });

        const response = await putCommencementDate({
          orderId: 'order-id', data: mockData, accessToken: 'access_token',
        });

        expect(response).toEqual(responseData);
      });

      it('should throw an error if api request is unsuccessful with non 400', async () => {
        putData
          .mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

        try {
          await putCommencementDate({
            orderId: 'order-id', data: mockData, accessToken: 'access_token',
          });
        } catch (err) {
          expect(err).toEqual(new Error());
        }
      });
    });

    describe('with no errors', () => {
      beforeEach(() => {
        putData.mockReset();
      });

      it('should call putData once with the correct params', async () => {
        putData.mockResolvedValueOnce({});

        await putCommencementDate({
          orderId: 'order-id', data: mockData, accessToken: 'access_token',
        });
        expect(putData.mock.calls.length).toEqual(1);
        expect(putData).toHaveBeenCalledWith({
          endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/commencement-date`,
          body: { commencementDate: '2020-12-21' },
          accessToken: 'access_token',
          logger,
        });
      });

      it('should call putData once with the correct params when day and month are single digit', async () => {
        putData
          .mockResolvedValueOnce({});

        const data = {
          'commencementDate-day': '1',
          'commencementDate-month': '2',
          'commencementDate-year': '2020',
        };

        await putCommencementDate({
          orderId: 'order-id', data, accessToken: 'access_token',
        });
        expect(putData.mock.calls.length).toEqual(1);
        expect(putData).toHaveBeenCalledWith({
          endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/commencement-date`,
          body: { commencementDate: '2020-02-01' },
          accessToken: 'access_token',
          logger,
        });
      });

      it('should return success as true if data is saved successfully', async () => {
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

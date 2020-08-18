import { getCommencementDateContext, validateCommencementDateForm } from './controller';
import * as contextCreator from './contextCreator';
import { getCommencementDate } from '../../../helpers/api/ordapi/getCommencementDate';

jest.mock('../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../helpers/api/ordapi/getCommencementDate');

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
});

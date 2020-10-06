import {
  getDeliveryDateContext,
  validateDeliveryDateForm,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('../../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('delivery-date controller', () => {
  describe('getDeliveryDateContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls getContext once with correct params', async () => {
      contextCreator.getContext.mockResolvedValueOnce();

      await getDeliveryDateContext({
        orderId: 'order-id',
        itemName: 'Solution One',
        commencementDate: '2020-10-10',
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        itemName: 'Solution One',
        data: {
          'deliveryDate-day': '10',
          'deliveryDate-month': '10',
          'deliveryDate-year': '2020',
        },
      });
    });
  });

  describe('validateDeliveryDate', () => {
    describe('when there are no validation errors', () => {
      it('should return an empty erray', () => {
        const data = {
          'deliveryDate-day': '09',
          'deliveryDate-month': '02',
          'deliveryDate-year': '2021',
        };

        const errors = validateDeliveryDateForm({ data });

        expect(errors).toEqual([]);
      });
    });

    describe('when there are validation errors', () => {
      const deliveryDateRequired = {
        field: 'DeliveryDate',
        id: 'DeliveryDateRequired',
        part: ['day', 'month', 'year'],
      };

      it('should return an array of one validation error if deliveryDate is not valid', () => {
        const data = {
          'deliveryDate-day': '',
          'deliveryDate-month': '',
          'deliveryDate-year': '',
        };

        const errors = validateDeliveryDateForm({ data });

        expect(errors).toEqual([deliveryDateRequired]);
      });
    });
  });
});

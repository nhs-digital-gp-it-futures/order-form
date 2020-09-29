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
          'plannedDeliveryDate-day': '10',
          'plannedDeliveryDate-month': '10',
          'plannedDeliveryDate-year': '2020',
        },
      });
    });
  });

  describe('validatePlannedDeliveryDate', () => {
    describe('when there are no validation errors', () => {
      it('should return an empty erray', () => {
        const data = {
          'plannedDeliveryDate-day': '09',
          'plannedDeliveryDate-month': '02',
          'plannedDeliveryDate-year': '2021',
        };

        const errors = validateDeliveryDateForm({ data });

        expect(errors).toEqual([]);
      });
    });

    describe('when there are validation errors', () => {
      const plannedDeliveryDateRequired = {
        field: 'PlannedDeliveryDate',
        id: 'PlannedDeliveryDateRequired',
        part: ['day', 'month', 'year'],
      };

      it('should return an array of one validation error if deliveryDate is not valid', () => {
        const data = {
          'plannedDeliveryDate-day': '',
          'plannedDeliveryDate-month': '',
          'plannedDeliveryDate-year': '',
        };

        const errors = validateDeliveryDateForm({ data });

        expect(errors).toEqual([plannedDeliveryDateRequired]);
      });
    });
  });
});

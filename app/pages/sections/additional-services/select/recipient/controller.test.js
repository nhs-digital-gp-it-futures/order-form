import {
  getAdditionalServiceRecipientPageContext,
  validateAdditionalServiceRecipientForm,
  getAdditionalServiceRecipientName,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('Additional-services select-recipient controller', () => {
  describe('getRecipientPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getAdditionalServiceRecipientPageContext({ orderId: 'order-1', itemName: 'Item name' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1', itemName: 'Item name' });
    });
  });
  describe('validateRecipientForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          selectRecipient: 'some-recipient-id',
        };

        const response = validateAdditionalServiceRecipientForm({ data });

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

        const response = validateAdditionalServiceRecipientForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return an array of one validation error and success as false if whitespace only is passed in', () => {
        const data = {
          selectRecipient: '   ',
        };

        const response = validateAdditionalServiceRecipientForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });

      it('should return a validation error if supplierName is undefined', () => {
        const data = {};

        const response = validateAdditionalServiceRecipientForm({ data });

        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });

  describe('getServiceRecipientName', () => {
    it('when service recipient id is found should return correct name', () => {
      const data = {
        serviceRecipientId: 'some-ods-code',
        recipients: [
          {
            odsCode: 'some-ods-code',
            name: 'some-recipient-name',
          },
          {
            odsCode: 'some-other-ods-code',
            name: 'some-other-recipient-name',
          },
        ],
      };

      const name = getAdditionalServiceRecipientName(data);

      expect(name).toEqual('some-recipient-name');
    });

    it('when service recipient id is not found should throw error', () => {
      const data = {
        serviceRecipientId: 'some-other-ods-code',
        recipients: [
          {
            odsCode: 'some-ods-code',
            name: 'some-recipient-name',
          },
        ],
      };

      expect(() => getAdditionalServiceRecipientName(data)).toThrow(Error);
    });

    it('when recipients is empty should throw error', () => {
      const data = {
        serviceRecipientId: 'some-ods-code',
        recipients: [],
      };

      expect(() => getAdditionalServiceRecipientName(data)).toThrow(Error);
    });
  });
});

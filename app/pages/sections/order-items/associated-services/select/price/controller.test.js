import {
  validateAssociatedServicePriceForm,
} from './controller';

describe('validateAssociatedServicePriceForm', () => {
  describe('when there are no validation errors', () => {
    it('should return success as true', () => {
      const data = {
        selectAssociatedServicePrice: 'some-associated-service-id',
      };

      const response = validateAssociatedServicePriceForm({ data });

      expect(response.success).toEqual(true);
    });
  });

  describe('when there are validation errors', () => {
    const expectedValidationErrors = [
      {
        field: 'selectAssociatedServicePrice',
        id: 'SelectAssociatedServicePriceRequired',
      },
    ];

    it('should return an array of one validation error and success as false if empty string is passed in', () => {
      const data = {
        selectAssociatedServicePrice: '',
      };

      const response = validateAssociatedServicePriceForm({ data });

      expect(response.success).toEqual(false);
      expect(response.errors).toEqual(expectedValidationErrors);
    });

    it('should return an array of one validation error and success as false if whitespace only is passed in', () => {
      const data = {
        selectAssociatedServicePrice: '   ',
      };

      const response = validateAssociatedServicePriceForm({ data });

      expect(response.success).toEqual(false);
      expect(response.errors).toEqual(expectedValidationErrors);
    });

    it('should return a validation error if selectAssociatedServicePrice is undefined', () => {
      const data = {};

      const response = validateAssociatedServicePriceForm({ data });

      expect(response.errors).toEqual(expectedValidationErrors);
    });
  });
});

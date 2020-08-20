import {
  validateAdditionalServicePriceForm,
} from './controller';

describe('validateAdditionalServicePriceForm', () => {
  describe('when there are no validation errors', () => {
    it('should return success as true', () => {
      const data = {
        selectAdditionalServicePrice: 'some-additional-service-id',
      };

      const response = validateAdditionalServicePriceForm({ data });

      expect(response.success).toEqual(true);
    });
  });

  describe('when there are validation errors', () => {
    const expectedValidationErrors = [
      {
        field: 'selectAdditionalServicePrice',
        id: 'SelectAdditionalServicePriceRequired',
      },
    ];

    it('should return an array of one validation error and success as false if empty string is passed in', () => {
      const data = {
        selectAdditionalServicePrice: '',
      };

      const response = validateAdditionalServicePriceForm({ data });

      expect(response.success).toEqual(false);
      expect(response.errors).toEqual(expectedValidationErrors);
    });

    it('should return an array of one validation error and success as false if whitespace only is passed in', () => {
      const data = {
        selectAdditionalServicePrice: '   ',
      };

      const response = validateAdditionalServicePriceForm({ data });

      expect(response.success).toEqual(false);
      expect(response.errors).toEqual(expectedValidationErrors);
    });

    it('should return a validation error if selectAdditionalServicePrice is undefined', () => {
      const data = {};

      const response = validateAdditionalServicePriceForm({ data });

      expect(response.errors).toEqual(expectedValidationErrors);
    });
  });
});

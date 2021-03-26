import { validateSolutionRecipientsForm } from './validateSolutionRecipientsForm';

describe('validateSolutionRecipientsForm', () => {
  describe('when there are no validation errors', () => {
    it('should return success as true', () => {
      const data = ['B81032'];

      const response = validateSolutionRecipientsForm({ data });

      expect(response.success).toEqual(true);
    });
  });

  describe('when there are validation errors', () => {
    const expectedValidationErrors = [
      {
        field: 'selectSolutionRecipients',
        id: 'SelectSolutionRecipientsRequired',
      },
    ];

    it('should return an array of one validation error and success as false if no key passed in', () => {
      const data = [];

      const response = validateSolutionRecipientsForm({ data });

      expect(response.success).toEqual(false);
      expect(response.errors).toEqual(expectedValidationErrors);
    });
  });
});

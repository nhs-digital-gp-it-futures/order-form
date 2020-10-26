import { extractDate } from './extractDate';

describe('extractDate', () => {
  describe('is array', () => {
    it('should return the date provided as YYYY-MM-DD', () => {
      const data = [{
        'somefield-day': '09',
        'somefield-month': '02',
        'somefield-year': '2020',
      }];

      const extractedDate = extractDate('somefield', data, 0);

      expect(extractedDate).toEqual('2020-02-09');
    });

    it('should return the month and day as a 2 digit number if only a single digit is provided', () => {
      const data = [{
        'somefield-day': '9',
        'somefield-month': '2',
        'somefield-year': '2020',
      }];

      const extractedDate = extractDate('somefield', data, 0);

      expect(extractedDate).toEqual('2020-02-09');
    });

    it('should only extract date details from the question id provided', () => {
      const data = [{
        'somefield-day': '09',
        'somefield-month': '02',
        'somefield-year': '2020',
        'somefield-again-day': '12',
        'somefield-again-month': '31',
        'somefield-again-year': '2021',
      }];

      const extractedDate = extractDate('somefield', data, 0);

      expect(extractedDate).toEqual('2020-02-09');
    });
  });
  describe('is not array', () => {
    it('should return undefined in no data for date is provided', () => {
      const data = {};

      const extractedDate = extractDate('somefield', data);

      expect(extractedDate).toEqual(undefined);
    });

    it('should return the date provided as YYYY-MM-DD', () => {
      const data = {
        'somefield-day': '09',
        'somefield-month': '02',
        'somefield-year': '2020',
      };

      const extractedDate = extractDate('somefield', data);

      expect(extractedDate).toEqual('2020-02-09');
    });

    it('should return the month and day as a 2 digit number if only a single digit is provided', () => {
      const data = {
        'somefield-day': '9',
        'somefield-month': '2',
        'somefield-year': '2020',
      };

      const extractedDate = extractDate('somefield', data);

      expect(extractedDate).toEqual('2020-02-09');
    });

    it('should only extract date details from the question id provided', () => {
      const data = {
        'somefield-day': '09',
        'somefield-month': '02',
        'somefield-year': '2020',
        'somefield-again-day': '12',
        'somefield-again-month': '31',
        'somefield-again-year': '2021',
      };

      const extractedDate = extractDate('somefield', data);

      expect(extractedDate).toEqual('2020-02-09');
    });
  });
});

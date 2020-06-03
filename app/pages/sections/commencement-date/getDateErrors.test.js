import { getDateErrors } from './getDateErrors';

const mockData = {
  'commencementDate-day': '01',
  'commencementDate-month': '12',
  'commencementDate-year': '2020',
};

describe('getDateErrors', () => {
  it('should return null when date is valid', () => {
    const validationResponse = getDateErrors(mockData);
    expect(validationResponse).toEqual(null);
  });

  it('should return CommencementDateRequired error when date is missing', () => {
    const validationResponse = getDateErrors({});
    expect(validationResponse.field).toEqual('CommencementDate');
    expect(validationResponse.id).toEqual('CommencementDateRequired');
    expect(validationResponse.part.length).toEqual(3);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(true);
  });

  it('should return CommencementDateDayRequired error when day is missing', () => {
    const validationResponse = getDateErrors({ ...mockData, 'commencementDate-day': undefined });
    expect(validationResponse.field).toEqual('CommencementDate');
    expect(validationResponse.id).toEqual('CommencementDateDayRequired');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(false);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return CommencementDateMonthRequired error when month is missing', () => {
    const validationResponse = getDateErrors({ ...mockData, 'commencementDate-month': undefined });
    expect(validationResponse.field).toEqual('CommencementDate');
    expect(validationResponse.id).toEqual('CommencementDateMonthRequired');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(false);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return CommencementDateMonthRequired error when year is missing', () => {
    const validationResponse = getDateErrors({ ...mockData, 'commencementDate-year': undefined });
    expect(validationResponse.field).toEqual('CommencementDate');
    expect(validationResponse.id).toEqual('CommencementDateYearRequired');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(false);
    expect(validationResponse.part.includes('month')).toBe(false);
    expect(validationResponse.part.includes('year')).toBe(true);
  });

  it('should return CommencementDateNotReal error when year is not 4 chars', () => {
    const validationResponseLess = getDateErrors({ ...mockData, 'commencementDate-year': '20' });
    expect(validationResponseLess.field).toEqual('CommencementDate');
    expect(validationResponseLess.id).toEqual('CommencementDateYearLength');
    expect(validationResponseLess.part.length).toEqual(1);
    expect(validationResponseLess.part.includes('day')).toBe(false);
    expect(validationResponseLess.part.includes('month')).toBe(false);
    expect(validationResponseLess.part.includes('year')).toBe(true);

    const validationResponseMore = getDateErrors({ ...mockData, 'commencementDate-year': '202020' });
    expect(validationResponseMore.field).toEqual('CommencementDate');
    expect(validationResponseMore.id).toEqual('CommencementDateYearLength');
    expect(validationResponseMore.part.length).toEqual(1);
    expect(validationResponseMore.part.includes('day')).toBe(false);
    expect(validationResponseMore.part.includes('month')).toBe(false);
    expect(validationResponseMore.part.includes('year')).toBe(true);
  });

  it('should return CommencementDateNotReal error for "day" when day is over 31', () => {
    const validationResponse = getDateErrors({ ...mockData, 'commencementDate-day': '32' });
    expect(validationResponse.field).toEqual('CommencementDate');
    expect(validationResponse.id).toEqual('CommencementDateNotReal');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(false);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return CommencementDateNotReal error for "month" when month is over 12', () => {
    const validationResponse = getDateErrors({ ...mockData, 'commencementDate-month': '13' });
    expect(validationResponse.field).toEqual('CommencementDate');
    expect(validationResponse.id).toEqual('CommencementDateNotReal');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(false);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return CommencementDateNotReal error for "day" and "month" when date is invalid', () => {
    const validationResponse = getDateErrors({ 'commencementDate-day': '31', 'commencementDate-month': '2', 'commencementDate-year': '2020' });
    expect(validationResponse.field).toEqual('CommencementDate');
    expect(validationResponse.id).toEqual('CommencementDateNotReal');
    expect(validationResponse.part.length).toEqual(2);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return CommencementDateNotReal error when year is < 1000', () => {
    const validationResponse = getDateErrors({ ...mockData, 'commencementDate-year': '0999' });
    expect(validationResponse.field).toEqual('CommencementDate');
    expect(validationResponse.id).toEqual('CommencementDateNotReal');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(false);
    expect(validationResponse.part.includes('month')).toBe(false);
    expect(validationResponse.part.includes('year')).toBe(true);
  });

  it('should return CommencementDateNotReal error for "day" and "month" when day and month not numbers', () => {
    const validationResponse = getDateErrors({ 'commencementDate-day': 'a', 'commencementDate-month': 'a', 'commencementDate-year': 'aaaa' });
    expect(validationResponse.field).toEqual('CommencementDate');
    expect(validationResponse.id).toEqual('CommencementDateNotReal');
    expect(validationResponse.part.length).toEqual(2);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(false);
  });
});

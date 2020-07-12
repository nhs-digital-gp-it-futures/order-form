import { getDateErrors } from './getDateErrors';

const mockData = {
  'someDate-day': '01',
  'someDate-month': '12',
  'someDate-year': '2020',
};

describe('getDateErrors', () => {
  it('should return null when date is valid', () => {
    const validationResponse = getDateErrors('someDate', mockData);
    expect(validationResponse).toEqual(null);
  });

  it('should return someDateRequired error when date is missing', () => {
    const validationResponse = getDateErrors('someDate', {});
    expect(validationResponse.field).toEqual('SomeDate');
    expect(validationResponse.id).toEqual('SomeDateRequired');
    expect(validationResponse.part.length).toEqual(3);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(true);
  });

  it('should return someDateDayRequired error when day is missing', () => {
    const validationResponse = getDateErrors('someDate', { ...mockData, 'someDate-day': undefined });
    expect(validationResponse.field).toEqual('SomeDate');
    expect(validationResponse.id).toEqual('SomeDateDayRequired');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(false);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return someDateMonthRequired error when month is missing', () => {
    const validationResponse = getDateErrors('someDate', { ...mockData, 'someDate-month': undefined });
    expect(validationResponse.field).toEqual('SomeDate');
    expect(validationResponse.id).toEqual('SomeDateMonthRequired');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(false);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return someDateMonthRequired error when year is missing', () => {
    const validationResponse = getDateErrors('someDate', { ...mockData, 'someDate-year': undefined });
    expect(validationResponse.field).toEqual('SomeDate');
    expect(validationResponse.id).toEqual('SomeDateYearRequired');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(false);
    expect(validationResponse.part.includes('month')).toBe(false);
    expect(validationResponse.part.includes('year')).toBe(true);
  });

  it('should return someDateNotReal error when year is not 4 chars', () => {
    const validationResponseLess = getDateErrors('someDate', { ...mockData, 'someDate-year': '20' });
    expect(validationResponseLess.field).toEqual('SomeDate');
    expect(validationResponseLess.id).toEqual('SomeDateYearLength');
    expect(validationResponseLess.part.length).toEqual(1);
    expect(validationResponseLess.part.includes('day')).toBe(false);
    expect(validationResponseLess.part.includes('month')).toBe(false);
    expect(validationResponseLess.part.includes('year')).toBe(true);

    const validationResponseMore = getDateErrors('someDate', { ...mockData, 'someDate-year': '202020' });
    expect(validationResponseMore.field).toEqual('SomeDate');
    expect(validationResponseMore.id).toEqual('SomeDateYearLength');
    expect(validationResponseMore.part.length).toEqual(1);
    expect(validationResponseMore.part.includes('day')).toBe(false);
    expect(validationResponseMore.part.includes('month')).toBe(false);
    expect(validationResponseMore.part.includes('year')).toBe(true);
  });

  it('should return someDateNotReal error for "day" when day is over 31', () => {
    const validationResponse = getDateErrors('someDate', { ...mockData, 'someDate-day': '32' });
    expect(validationResponse.field).toEqual('SomeDate');
    expect(validationResponse.id).toEqual('SomeDateNotReal');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(false);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return someDateNotReal error for "month" when month is over 12', () => {
    const validationResponse = getDateErrors('someDate', { ...mockData, 'someDate-month': '13' });
    expect(validationResponse.field).toEqual('SomeDate');
    expect(validationResponse.id).toEqual('SomeDateNotReal');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(false);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return someDateNotReal error for "day" and "month" when date is invalid', () => {
    const validationResponse = getDateErrors('someDate', { 'someDate-day': '31', 'someDate-month': '2', 'someDate-year': '2020' });
    expect(validationResponse.field).toEqual('SomeDate');
    expect(validationResponse.id).toEqual('SomeDateNotReal');
    expect(validationResponse.part.length).toEqual(2);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(false);
  });

  it('should return someDateNotReal error when year is < 1000', () => {
    const validationResponse = getDateErrors('someDate', { ...mockData, 'someDate-year': '0999' });
    expect(validationResponse.field).toEqual('SomeDate');
    expect(validationResponse.id).toEqual('SomeDateNotReal');
    expect(validationResponse.part.length).toEqual(1);
    expect(validationResponse.part.includes('day')).toBe(false);
    expect(validationResponse.part.includes('month')).toBe(false);
    expect(validationResponse.part.includes('year')).toBe(true);
  });

  it('should return someDateNotReal error for "day" and "month" when day and month not numbers', () => {
    const validationResponse = getDateErrors('someDate', { 'someDate-day': 'a', 'someDate-month': 'a', 'someDate-year': 'aaaa' });
    expect(validationResponse.field).toEqual('SomeDate');
    expect(validationResponse.id).toEqual('SomeDateNotReal');
    expect(validationResponse.part.length).toEqual(2);
    expect(validationResponse.part.includes('day')).toBe(true);
    expect(validationResponse.part.includes('month')).toBe(true);
    expect(validationResponse.part.includes('year')).toBe(false);
  });
});

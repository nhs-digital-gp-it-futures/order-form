import { formatDate } from './dateFormatter';

describe('formatDate', () => {
  it('returns correctly formatted date when valid string is passed in', () => {
    expect(formatDate('2020-05-06T11:29:52.4965647Z')).toEqual('6 May 2020');
    expect(formatDate('2025-12-31T11:29:52.4965647Z')).toEqual('31 December 2025');
  });

  it('returns empty string when invalid string is passed in', () => {
    expect(formatDate('2020-05-06T11:29:52.4965647Znnnn')).toEqual('');
    expect(formatDate('2020-05-32T11:29:52.4965647Z')).toEqual('');
    expect(formatDate('abc')).toEqual('');
  });

  it('returns empty string when nothing is passed in', () => {
    expect(formatDate()).toEqual('');
  });
});

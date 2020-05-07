import { formatDate } from './dateFormatter';

describe('formatDate', () => {
  it('returns correctly formatted date', () => {
    expect(formatDate('2020-05-06T11:29:52.4965647Z')).toEqual('6 May 2020');
    expect(formatDate('2025-12-31T11:29:52.4965647Z')).toEqual('31 December 2025');
  });
});

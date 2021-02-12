import { formatPrice, formatNumber, removeCommas } from './priceFormatter';

describe('formatPrice', () => {
  it.each`
    value          | minimumFractionDigits    | maximumFractionDigits | expected
    ${10}          | ${0}                     | ${2}                  | ${'10'}
    ${10.00}       | ${0}                     | ${4}                  | ${'10'}
    ${10.10}       | ${0}                     | ${2}                  | ${'10.10'}
    ${10}          | ${2}                     | ${2}                  | ${'10.00'}
    ${10.0001}     | ${2}                     | ${4}                  | ${'10.0001'}
    ${999.999}     | ${2}                     | ${4}                  | ${'999.999'}
    ${1234.560}    | ${2}                     | ${4}                  | ${'1,234.56'}
    ${1234.56019}  | ${2}                     | ${4}                  | ${'1,234.5602'}
    ${12.011}      | ${2}                     | ${2}                  | ${'12.01'}
    ${12}          | ${5}                     | ${5}                  | ${'12.00000'}
    ${12.0}        | ${1}                     | ${5}                  | ${'12.0'}
  `('formatPrice $value should be formatted to $expected', ({
    value, minimumFractionDigits, maximumFractionDigits, expected,
  }) => {
    expect(formatPrice({ value, minimumFractionDigits, maximumFractionDigits })).toEqual(expected);
  });
});

describe('formatNumber', () => {
  it.each`
  value        | expected
  ${10}             | ${'10'}
  ${10.1}           | ${'10.1'}
  ${12.34}          | ${'12.34'}
  ${999.999}        | ${'999.999'}
  ${999.9999}       | ${'999.9999'}
  ${999.99999999}   | ${'1,000'}
  ${999.1111111}    | ${'999.1111'}
  ${999.123456789}  | ${'999.1235'}
`('formatNumber $value should be formatted to $expected', ({ value, expected }) => {
    expect(formatNumber({ value })).toEqual(expected);
  });
});

describe('removeCommas', () => {
  it.each`
  value                 | expected
  ${'10,000'}           | ${'10000'}
  ${'10,000,000,'}      | ${'10000000'}
  ${'10,000,000,000,'}  | ${'10000000000'}
  ${',,,,,,,,,,'}       | ${''}
`('removeCommas $value should be formatted to $expected', ({ value, expected }) => {
    expect(removeCommas(value)).toEqual(expected);
  });
});

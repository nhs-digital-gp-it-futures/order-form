import { formatPrice, formatNumber } from './priceFormatter';

describe('formatPrice', () => {
  it.each`
    priceValue   | expected
    ${10}        | ${'10.00'}
    ${1000}      | ${'1,000.00'}
    ${888.8888}   | ${'888.8888'}
    ${999.999}   | ${'999.999'}
    ${1234.560}  | ${'1,234.56'}
    ${12.011}    | ${'12.011'}
    ${15.011248}    | ${'15.0112'}
    ${999.123456789}   | ${'999.1235'}
  `('formatPrice $priceValue should be formatted to $expected', ({ priceValue, expected }) => {
    expect(formatPrice(priceValue)).toEqual(expected);
  });
});

describe('formatNumber', () => {
  it.each`
  priceValue   | expected
  ${10}        | ${'10'}
  ${10.1}      | ${'10.1'}
  ${10.10}      | ${'10.1'}
  ${12.34}     | ${'12.34'}
  ${888.8888}   | ${'888.8888'}
  ${999.999}   | ${'999.999'}
  ${999.123456789}   | ${'999.1235'}
`('formatNumber $priceValue should be formatted to $expected', ({ priceValue, expected }) => {
    expect(formatNumber({ value: priceValue })).toEqual(expected);
  });
});

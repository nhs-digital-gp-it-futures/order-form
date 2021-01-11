import { formatPrice, formatDecimal } from './priceFormatter';

describe('formatPrice', () => {
  it.each`
    priceValue   | expected
    ${10}        | ${'10.00'}
    ${1000}      | ${'1,000.00'}
    ${999.999}   | ${'999.99'}
    ${1234.560}  | ${'1,234.56'}
    ${12.011}    | ${'12.01'}
  `('formatPrice $priceValue should be formatted to $expected', ({ priceValue, expected }) => {
    expect(formatPrice(priceValue)).toEqual(expected);
  });
});

describe('formatDecimal', () => {
  it.each`
  priceValue   | expected
  ${10}        | ${10}
  ${10.1}      | ${'10.10'}
  ${12.34}     | ${'12.34'}
  ${999.999}   | ${999.999}
`('formatDecimal $priceValue should be formatted to $expected', ({ priceValue, expected }) => {
    expect(formatDecimal(priceValue)).toEqual(expected);
  });
});

export const getQuantityError = (quantity) => {
  if (!quantity || quantity.trim().length === 0) {
    return {
      field: 'Quantity',
      id: 'QuantityRequired',
    };
  } if (Number.isNaN(Number(quantity))) {
    return {
      field: 'Quantity',
      id: 'QuantityMustBeANumber',
    };
  } if (quantity <= 0) {
    return {
      field: 'Quantity',
      id: 'QuantityGreaterThanZero',
    };
  } if (quantity.indexOf('.') !== -1) {
    return {
      field: 'Quantity',
      id: 'QuantityInvalid',
    };
  } if (quantity > 2147483646) {
    return {
      field: 'Quantity',
      id: 'QuantityLessThanMax',
    };
  }
  return null;
};

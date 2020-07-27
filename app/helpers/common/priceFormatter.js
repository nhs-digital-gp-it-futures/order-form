export const formatPrice = (priceValue) => {
  const formattedPrice = priceValue.toLocaleString(undefined, {
    minimumFractionDigits: 3, maximumFractionDigits: 3,
  });

  const truncatedTo2dp = formattedPrice.substring(0, formattedPrice.indexOf('.') + 3);

  return truncatedTo2dp;
};

export const formatDecimal = (priceValue) => {
  if ((priceValue || {}).toString().includes('.') && priceValue.toString().split('.')[1].length < 3) {
    return parseFloat(priceValue).toFixed(2);
  }
  return priceValue;
};

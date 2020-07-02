export const formatPrice = (priceValue) => {
  const formattedPrice = priceValue.toLocaleString(undefined, {
    minimumFractionDigits: 3, maximumFractionDigits: 3,
  });

  const truncatedTo2dp = formattedPrice.substring(0, formattedPrice.indexOf('.') + 3);

  return truncatedTo2dp;
};

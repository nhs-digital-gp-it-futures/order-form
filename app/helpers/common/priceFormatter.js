export const formatNumber = ({ value, minimumFractionDigits = 0, maximumFractionDigits = 4 }) => (
  parseFloat(value)
    .toLocaleString(
      undefined, { minimumFractionDigits, maximumFractionDigits },
    )
);

export const formatPrice = (value) => formatNumber({ value, minimumFractionDigits: 2 });

export const formatNumber = ({
  value, minimumFractionDigits = 0, maximumFractionDigits = 4,
}) => (
  parseFloat(value)
    .toLocaleString(
      undefined, { minimumFractionDigits, maximumFractionDigits },
    )
);

export const formatPrice = ({ value, minimumFractionDigits = 2, maximumFractionDigits = 4 }) => {
  if (minimumFractionDigits === 0) {
    if (!Number.isNaN(Number(value)) && !Number.isNaN(parseFloat(value))) {
      if (Number.isInteger(Number.parseFloat(value))) {
        return formatNumber({ value, maximumFractionDigits });
      }
      return formatNumber({ value, minimumFractionDigits: 2, maximumFractionDigits });
    }
    return value;
  }
  return formatNumber({ value, minimumFractionDigits, maximumFractionDigits });
};

export const removeCommas = (string) => string.replace(/,/g, '');

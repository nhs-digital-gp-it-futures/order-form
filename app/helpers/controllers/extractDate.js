const extractDateComponents = ({ fieldName, data }) => ({
  day: data[`${fieldName}-day`],
  month: data[`${fieldName}-month`],
  year: data[`${fieldName}-year`],
});

export const extractDate = (fieldName, data, index) => {
  const date = extractDateComponents({
    fieldName,
    data: Array.isArray(data) ? data[index] : data,
  });

  if (date.day && date.month && date.year) {
    return `${date.year}-${date.month.length === 1 ? '0' : ''}${date.month}-${date.day.length === 1 ? '0' : ''}${date.day}`;
  }

  return undefined;
};

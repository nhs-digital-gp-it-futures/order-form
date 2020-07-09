export const extractDate = (fieldName, data) => {
  const day = data[`${fieldName}-day`];
  const month = data[`${fieldName}-month`];
  const year = data[`${fieldName}-year`];
  return `${year}-${month.length === 1 ? '0' : ''}${month}-${day.length === 1 ? '0' : ''}${day}`;
};

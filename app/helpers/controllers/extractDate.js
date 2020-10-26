export const extractDate = (fieldName, data, index) => {
  let day;
  let month;
  let year;

  if (Array.isArray(data)) {
    day = data[index][`${fieldName}-day`];
    month = data[index][`${fieldName}-month`];
    year = data[index][`${fieldName}-year`];
  } else {
    day = data[`${fieldName}-day`];
    month = data[`${fieldName}-month`];
    year = data[`${fieldName}-year`];
  }
  if (day && month && year) {
    return `${year}-${month.length === 1 ? '0' : ''}${month}-${day.length === 1 ? '0' : ''}${day}`;
  }

  return undefined;
};

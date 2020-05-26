export const getDateErrors = (data) => {
  const errorsMap = [
    {
      field: 'CommencementDate',
      part: ['day', 'month', 'year'],
      id: 'CommencementDateRequired',
    },
    {
      field: 'CommencementDate',
      part: ['day'],
      id: 'CommencementDateDayRequired',
    },
    {
      field: 'CommencementDate',
      part: ['month'],
      id: 'CommencementDateMonthRequired',
    },
    {
      field: 'CommencementDate',
      part: ['year'],
      id: 'CommencementDateYearRequired',
    },
    {
      field: 'CommencementDate',
      part: ['day', 'month', 'year'],
      id: 'CommencementDateInvalid',
    },
    {
      field: 'CommencementDate',
      part: ['day', 'month'],
      id: 'CommencementDateNotReal',
    },
  ];
  const day = data['commencementDate-day'];
  const month = data['commencementDate-month'];
  const year = data['commencementDate-year'];

  if (!day && !month && !year) return errorsMap[0];
  if (!day) return errorsMap[1];
  if (!month) return errorsMap[2];
  if (!year) return errorsMap[3];
  if (+day > 31) return { ...errorsMap[5], part: ['day'] };
  if (+month > 12) return { ...errorsMap[5], part: ['month'] };

  const date = new Date(+year, +month - 1, +day);

  if (date.getFullYear() !== +year || date.getMonth() + 1 !== +month) return errorsMap[5];
  return null;
};

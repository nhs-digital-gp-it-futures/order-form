export const getDateErrors = (data) => {
  const errorsMap = {
    CommencementDateRequired: {
      field: 'CommencementDate',
      part: ['day', 'month', 'year'],
      id: 'CommencementDateRequired',
    },
    CommencementDateDayRequired: {
      field: 'CommencementDate',
      part: ['day'],
      id: 'CommencementDateDayRequired',
    },
    CommencementDateMonthRequired: {
      field: 'CommencementDate',
      part: ['month'],
      id: 'CommencementDateMonthRequired',
    },
    CommencementDateYearRequired: {
      field: 'CommencementDate',
      part: ['year'],
      id: 'CommencementDateYearRequired',
    },
    CommencementDateNotReal: {
      field: 'CommencementDate',
      part: ['day', 'month'],
      id: 'CommencementDateNotReal',
    },
    CommencementDateYearLength: {
      field: 'CommencementDate',
      part: ['year'],
      id: 'CommencementDateYearLength',
    },
  };
  const day = data['commencementDate-day'];
  const month = data['commencementDate-month'];
  const year = data['commencementDate-year'];

  if (!day && !month && !year) return errorsMap.CommencementDateRequired;
  if (!day) return errorsMap.CommencementDateDayRequired;
  if (!month) return errorsMap.CommencementDateMonthRequired;
  if (!year) return errorsMap.CommencementDateYearRequired;
  if (year.length !== 4) return errorsMap.CommencementDateYearLength;
  if (+day > 31) return { ...errorsMap.CommencementDateNotReal, part: ['day'] };
  if (+month > 12) return { ...errorsMap.CommencementDateNotReal, part: ['month'] };
  if (+year < 1000) return { ...errorsMap.CommencementDateNotReal, part: ['year'] };

  const date = new Date(+year, +month - 1, +day);
  if (date.getFullYear() !== +year || date.getMonth() + 1 !== +month) {
    return errorsMap.CommencementDateNotReal;
  }

  return null;
};

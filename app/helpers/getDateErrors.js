const errorsMap = questionId => ({
  required: {
    field: questionId,
    part: ['day', 'month', 'year'],
    id: `${questionId}Required`,
  },
  dayRequired: {
    field: questionId,
    part: ['day'],
    id: `${questionId}DayRequired`,
  },
  monthRequired: {
    field: questionId,
    part: ['month'],
    id: `${questionId}MonthRequired`,
  },
  yearRequired: {
    field: questionId,
    part: ['year'],
    id: `${questionId}YearRequired`,
  },
  notReal: {
    field: questionId,
    part: ['day', 'month'],
    id: `${questionId}NotReal`,
  },
  yearLength: {
    field: questionId,
    part: ['year'],
    id: `${questionId}YearLength`,
  },
});

export const getDateErrors = (questionId, data) => {
  const day = data[`${questionId}-day`];
  const month = data[`${questionId}-month`];
  const year = data[`${questionId}-year`];

  if (!day && !month && !year) return errorsMap(questionId).required;
  if (!day) return errorsMap(questionId).dayRequired;
  if (!month) return errorsMap(questionId).monthRequired;
  if (!year) return errorsMap(questionId).yearRequired;
  if (year.length !== 4) return errorsMap(questionId).yearLength;
  if (+day > 31) return { ...errorsMap(questionId).notReal, part: ['day'] };
  if (+month > 12) return { ...errorsMap(questionId).notReal, part: ['month'] };
  if (+year < 1000) return { ...errorsMap(questionId).notReal, part: ['year'] };

  const date = new Date(+year, +month - 1, +day);
  if (date.getFullYear() !== +year || date.getMonth() + 1 !== +month) {
    return errorsMap(questionId).notReal;
  }

  return null;
};

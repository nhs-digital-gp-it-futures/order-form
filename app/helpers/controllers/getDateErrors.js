const transformQuestionId = (questionId) => questionId.charAt(0).toUpperCase()
  + questionId.slice(1);

const errorsMap = (questionId) => {
  const transformedQuestionId = transformQuestionId(questionId);
  return ({
    required: {
      field: transformedQuestionId,
      part: ['day', 'month', 'year'],
      id: `${transformedQuestionId}Required`,
    },
    dayRequired: {
      field: transformedQuestionId,
      part: ['day'],
      id: `${transformedQuestionId}DayRequired`,
    },
    monthRequired: {
      field: transformedQuestionId,
      part: ['month'],
      id: `${transformedQuestionId}MonthRequired`,
    },
    yearRequired: {
      field: transformedQuestionId,
      part: ['year'],
      id: `${transformedQuestionId}YearRequired`,
    },
    notReal: {
      field: transformedQuestionId,
      part: ['day', 'month'],
      id: `${transformedQuestionId}NotReal`,
    },
    yearLength: {
      field: transformedQuestionId,
      part: ['year'],
      id: `${transformedQuestionId}YearLength`,
    },
  });
};

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

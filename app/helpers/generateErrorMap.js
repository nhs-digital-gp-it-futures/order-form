export const generateErrorMap = ({ validationErrors, errorMessagesFromManifest }) => {
  const { errorMapAcc: errorMap } = validationErrors.reduce(({ errorMapAcc }, validationError) => {
    const accumulatedMessages = errorMapAcc[validationError.field]
      ? errorMapAcc[validationError.field].errorMessages
        .concat(errorMessagesFromManifest[validationError.id])
      : [errorMessagesFromManifest[validationError.id]];

    return ({
      errorMapAcc: {
        ...errorMapAcc,
        [validationError.field]: {
          errorMessages: accumulatedMessages,
        },
      },
    });
  }, { errorMapAcc: {} });

  return errorMap;
};

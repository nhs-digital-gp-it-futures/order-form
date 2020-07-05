const transformFieldId = (fieldId) => {
  return fieldId.charAt(0).toLowerCase() + fieldId.slice(1);
};

export const generateErrorMap = ({ validationErrors, errorMessagesFromManifest }) => {
  const { errorMapAcc: errorMap } = validationErrors.reduce(({ errorMapAcc }, validationError) => {
    const fieldId = transformFieldId(validationError.field);
    const accumulatedMessages = errorMapAcc[fieldId]
      ? errorMapAcc[fieldId].errorMessages
        .concat(errorMessagesFromManifest[validationError.id])
      : [errorMessagesFromManifest[validationError.id]];

    return ({
      errorMapAcc: {
        ...errorMapAcc,
        [fieldId]: {
          errorMessages: accumulatedMessages,
        },
      },
    });
  }, { errorMapAcc: {} });

  return errorMap;
};

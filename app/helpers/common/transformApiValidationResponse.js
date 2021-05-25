const transformPropertyName = (propertyName) => {
  if (propertyName.startsWith('[')) {
    return propertyName.substring(4);
  }

  return propertyName.indexOf('].') > 0
    ? propertyName.split('].')[1] : propertyName;
};

export const transformApiValidationResponse = (validationResponse) => {
  const distinctApiErrors = Object
    .entries(validationResponse)
    .reduce((acc, [key, value]) => {
      const field = transformPropertyName(key);

      if (acc[field] === undefined) {
        acc[field] = new Set();
      }

      value.forEach((v) => acc[field].add(v));
      return acc;
    }, {});

  return Object
    .entries(distinctApiErrors)
    .flatMap(([key, value]) => [...value].map((v) => ({ field: key, id: v })));
};

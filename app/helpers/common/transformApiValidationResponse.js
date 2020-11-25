const transformPropertyName = propertyName => (propertyName.startsWith('[')
  ? propertyName.substring(4)
  : propertyName);

export const transformApiValidationResponse = (validationResponse) => {
  console.log(validationResponse);
  const distinctApiErrors = Object
    .entries(validationResponse)
    .reduce((acc, [key, value]) => {
      const field = transformPropertyName(key);

      if (acc[field] === undefined) {
        acc[field] = new Set();
      }

      value.forEach(v => acc[field].add(v));
      return acc;
    }, {});

    console.log(distinctApiErrors);
    console.log(Object.entries(distinctApiErrors));

  return Object
    .entries(distinctApiErrors)
    .flatMap(([key, value]) => [...value].map(v => ({ field: key, id: v })));
};

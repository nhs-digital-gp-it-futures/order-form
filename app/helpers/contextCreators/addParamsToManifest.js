export const addParamsToManifest = (json, params) => JSON.parse(
  Object.entries(params).reduce(
    (string, [key, value]) => string.replace(new RegExp(`{{${key}}}`, 'g'), value), JSON.stringify(json),
  ),
);

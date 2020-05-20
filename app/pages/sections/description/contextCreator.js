import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import manifest from './manifest.json';
import { baseUrl } from '../../../config';

export const getContext = ({ orderId, description }) => {
  const context = ({
    ...manifest,
    backlinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  context.questions[0].data = description;
  return context;
};

export const getErrorContext = ({ orderId, validationErrors, data }) => {
  const formattedErrors = formatErrors({ manifest, errors: validationErrors });
  const modifiedManifest = addErrorsAndDataToManifest({ manifest, errors: formattedErrors, data });
  const allErrors = formatAllErrors(modifiedManifest.questions);

  return {
    ...modifiedManifest,
    errors: allErrors,
    backlinkHref: `${baseUrl}/organisation/${orderId}`,
  };
};

import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

export const getContext = ({ orderId }) => {
  const context = ({
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  return context;
};

export const getErrorContext = ({ orderId, validationErrors, data }) => {
  const formattedErrors = formatErrors({ manifest, errors: validationErrors });
  const modifiedManifest = addErrorsAndDataToManifest({ manifest, errors: formattedErrors, data });
  const allErrors = formatAllErrors(modifiedManifest.questions);

  return {
    ...modifiedManifest,
    errors: allErrors,
    title: `${manifest.title} ${orderId}`,
    backlinkHref: `${baseUrl}/organisation/${orderId}`,
  };
};

import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import { baseUrl } from '../../config';

export const getSectionErrorContext = ({
  orderId, validationErrors, data, manifest,
}) => {
  const formattedErrors = formatErrors({ manifest, errors: validationErrors });
  const modifiedManifest = addErrorsAndDataToManifest({ manifest, errors: formattedErrors, data });
  const allErrors = formatAllErrors(modifiedManifest.questions);

  return {
    ...modifiedManifest,
    errors: allErrors,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  };
};

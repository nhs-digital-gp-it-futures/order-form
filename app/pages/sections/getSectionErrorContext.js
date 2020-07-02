import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import { baseUrl } from '../../config';

export const getSectionErrorContext = ({
  orderId, validationErrors, data, manifest,
}) => {
  console.log('manifest', manifest)
  console.log('validationErrors', validationErrors)

  const formattedErrors = formatErrors({ manifest, errors: validationErrors });
  const modifiedManifest = addErrorsAndDataToManifest({ manifest, errors: formattedErrors, data });
  const allErrors = formatAllErrors(modifiedManifest.questions);

  return {
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
    ...modifiedManifest,
    errors: allErrors,
  };
};

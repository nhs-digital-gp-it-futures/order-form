import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import { baseUrl } from '../../config';

export const getSectionErrorContext = ({
  orderId, validationErrors, data, manifest, odsCode,
}) => {
  const formattedErrors = formatErrors({ manifest, errors: validationErrors });
  const modifiedManifest = addErrorsAndDataToManifest({ manifest, errors: formattedErrors, data });
  const allErrors = formatAllErrors(modifiedManifest.questions);

  return {
    backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}`,
    ...modifiedManifest,
    errors: allErrors,
  };
};

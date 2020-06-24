import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import { baseUrl } from '../../config';

export const getSectionErrorContext = ({
  orderId, validationErrors, data, manifest,
}) => {
  const formattedErrors = formatErrors({ manifest, errors: validationErrors });
  const modifiedManifest = addErrorsAndDataToManifest({ manifest, errors: formattedErrors, data });
  console.log('modified manifest', modifiedManifest);
  const allErrors = formatAllErrors(modifiedManifest.questions);
  
  console.log('allerrors', allErrors);

  return {
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
    ...modifiedManifest,
    errors: allErrors,
  };
};

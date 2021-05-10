import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';
import { addParamsToManifest } from '../../../../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({
  orderId, orderItemId, solutionName, orderDescription, odsCode,
}) => {
  const context = ({
    ...addParamsToManifest(manifest, { orderId, orderItemId, solutionName }),
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/${orderItemId}`,
  });
  return context;
};

import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';
import { addParamsToManifest } from '../../../../../helpers/contextCreators/addParamsToManifest';

export const getContext = (
  {
    orderId, orderItemId, solutionName, orderDescription,
  }
  ) => {
  const context = ({
    ...addParamsToManifest(manifest, { orderId, orderItemId, solutionName }),
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/${orderItemId}`,
  });
  return context;
};

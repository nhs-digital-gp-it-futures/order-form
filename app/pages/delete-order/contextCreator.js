import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { addParamsToManifest } from '../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({ orderId, orderDescription, odsCode }) => {
  const context = ({
    ...addParamsToManifest(manifest, { orderId }),
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${odsCode}/${orderId}`,
  });
  return context;
};

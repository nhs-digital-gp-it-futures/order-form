import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { addParamsToManifest } from '../../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({ orderId, orderDescription }) => {
  const context = ({
    ...addParamsToManifest(manifest, { orderId }),
    orderDescription,
    backLinkHref: `${baseUrl}/organisation`,
  });
  return context;
};

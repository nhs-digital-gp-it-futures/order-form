import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { addParamsToManifest } from '../../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({ odsCode, orderId, orderDescription }) => {
  const context = ({
    ...addParamsToManifest(manifest, { orderId }),
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${odsCode}`,
  });
  return context;
};

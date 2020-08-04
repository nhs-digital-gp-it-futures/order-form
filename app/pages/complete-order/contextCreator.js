import withFundingManifest from './withFundingManifest.json';
import { baseUrl } from '../../config';
import { addParamsToManifest } from '../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({ orderId, orderDescription, fundingSource }) => {
  const manifest = fundingSource ? withFundingManifest : undefined;
  const context = ({
    ...addParamsToManifest(manifest, { orderId }),
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  return context;
};

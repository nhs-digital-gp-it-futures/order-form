import withFundingManifest from './withFundingManifest.json';
import { baseUrl } from '../../../config';
import { addParamsToManifest } from '../../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({ orderId, fundingSource }) => {
  const manifest = fundingSource ? withFundingManifest : undefined;
  const context = ({
    ...addParamsToManifest(manifest, { orderId }),
    backLinkHref: `${baseUrl}/organisation`,
  });
  return context;
};

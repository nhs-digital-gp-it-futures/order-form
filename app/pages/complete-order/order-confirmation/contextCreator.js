import withFundingManifest from './withFundingManifest.json';
import withoutFundingManifest from './withoutFundingManifest.json';
import { baseUrl } from '../../../config';
import { addParamsToManifest } from '../../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({ orderId, fundingSource }) => {
  const manifest = fundingSource ? withFundingManifest : withoutFundingManifest;
  const context = ({
    ...addParamsToManifest(manifest, { orderId }),
    backLinkHref: `${baseUrl}/organisation`,
    orderSummaryButtonHref: `${baseUrl}/organisation/${orderId}/preview?print=true`,
  });
  return context;
};

import withFundingManifest from './withFundingManifest.json';
import withoutFundingManifest from './withoutFundingManifest.json';
import { baseUrl } from '../../../config';
import { addParamsToManifest } from '../../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({ orderId, fundingSource, odsCode }) => {
  const manifest = fundingSource ? withFundingManifest : withoutFundingManifest;
  const context = ({
    ...addParamsToManifest(manifest, { orderId }),
    backLinkHref: `${baseUrl}/organisation/${odsCode}`,
    orderSummaryButtonHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/summary?print=true`,
  });
  return context;
};

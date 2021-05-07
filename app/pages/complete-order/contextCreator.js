import withFundingManifest from './withFundingManifest.json';
import withoutFundingManifest from './withoutFundingManifest.json';
import { baseUrl } from '../../config';
import { addParamsToManifest } from '../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({
  orderId, orderDescription, fundingSource, odsCode,
}) => {
  const manifest = fundingSource ? withFundingManifest : withoutFundingManifest;
  const context = ({
    ...addParamsToManifest(manifest, { orderId }),
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${odsCode}/${orderId}`,
    continueEditingOrderButtonHref: `${baseUrl}/organisation/${odsCode}/${orderId}`,
  });
  return context;
};

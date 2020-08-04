import withFundingManifest from './withFundingManifest.json';
import withoutFundingManifest from './withoutFundingManifest.json';
import { baseUrl } from '../../config';

export const getContext = ({ orderId, orderDescription, fundingSource }) => {
  const manifest = fundingSource ? withFundingManifest : withoutFundingManifest;
  const context = ({
    ...manifest,
    title: `${manifest.title} ${orderId}?`,
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  return context;
};

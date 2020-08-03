import withFundingManifest from './withFundingManifest.json';
import { baseUrl } from '../../config';

export const getContext = ({ orderId, orderDescription, fundingSource }) => {
  const manifest = fundingSource ? withFundingManifest : undefined;
  const context = ({
    ...manifest,
    title: `${manifest.title} ${orderId}?`,
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  return context;
};

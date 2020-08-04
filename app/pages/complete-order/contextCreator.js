import withFundingManifest from './withFundingManifest.json';
import { baseUrl } from '../../config';

export const addParamsToManifest = (json, params) => JSON.parse(
  Object.entries(params).reduce(
    (string, [key, value]) => string.replace(new RegExp(`{{${key}}}`, 'g'), value), JSON.stringify(json),
  ),
);

export const getContext = ({ orderId, orderDescription, fundingSource }) => {
  const manifest = fundingSource ? withFundingManifest : undefined;
  const context = ({
    ...addParamsToManifest(manifest, { orderId }),
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  return context;
};

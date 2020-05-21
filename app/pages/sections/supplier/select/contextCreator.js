import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

export const getContext = ({ orderId }) => {
  const context = ({
    ...manifest,
    backLinkHref: `${baseUrl}/organisation/${orderId}/supplier/search`,
  });
  return context;
};

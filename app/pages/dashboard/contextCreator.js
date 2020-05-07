import manifest from './manifest.json';
import { baseUrl } from '../../config';

export const getContext = ({ orgId }) => ({
  ...manifest,
  title: `${orgId} orders`,
  newOrderButtonHref: `${baseUrl}/organisation/neworder`,
  proxyLinkHref: '#',
});

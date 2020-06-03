import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

export const getContext = ({ orderId, orderDescription, solutions }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  solutions,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});

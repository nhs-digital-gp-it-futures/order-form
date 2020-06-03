import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

export const getContext = ({ orderId, orderDescription, catalogueSolutions }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  catalogueSolutions,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});

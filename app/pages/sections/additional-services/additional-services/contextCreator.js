import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

export const getContext = ({ orderId, orderDescription }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  addOrderItemButtonHref: `${baseUrl}/organisation/${orderId}/additional-services/select/solution`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});

import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

export const getContext = ({ orderId, orderDescription }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  addOrderItemButtonHref: `${baseUrl}/organisation/${orderId}/associated-services/select/associated-service`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});

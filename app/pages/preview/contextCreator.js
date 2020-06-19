import manifest from './manifest.json';
import { baseUrl } from '../../config';

export const getContext = ({ orderId, orderData }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription: orderData.description,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});

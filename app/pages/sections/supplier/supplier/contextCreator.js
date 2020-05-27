import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

export const getContext = ({ orderId, supplierData }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  supplierData,
  backLinkHref: `${baseUrl}/organisation/${orderId}/supplier/search/select`,
});

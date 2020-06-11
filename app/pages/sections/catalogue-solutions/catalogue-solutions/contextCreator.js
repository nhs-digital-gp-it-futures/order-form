import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

export const getContext = ({ orderId, orderDescription, catalogueSolutions }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  catalogueSolutions,
  addSolutionButtonHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/solution`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});

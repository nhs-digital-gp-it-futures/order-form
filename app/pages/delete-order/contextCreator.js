import manifest from './manifest.json';
import { baseUrl } from '../../config';

export const getDeleteOrderPageContext = ({ orderId, orderDescription }) => {
  const context = ({
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    orderDescription,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  return context;
};

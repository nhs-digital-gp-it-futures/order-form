import manifest from './manifest.json';
import { baseUrl } from '../../../config';

export const getContext = ({ orderId, description }) => {
  const context = ({
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  return context;
};

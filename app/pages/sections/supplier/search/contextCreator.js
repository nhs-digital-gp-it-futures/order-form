import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

export const getContext = ({ orderId }) => {
  const context = ({
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    backlinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  return context;
};

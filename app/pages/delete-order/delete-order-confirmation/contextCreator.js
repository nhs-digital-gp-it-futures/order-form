import manifest from './manifest.json';
import { baseUrl } from '../../../config';

export const getContext = ({ orderId, orderDescription }) => {
  const context = ({
    ...manifest,
    title: `${manifest.titlePartOne} ${orderId} ${manifest.titlePartTwo}`,
    orderDescription,
    backLinkHref: `${baseUrl}/organisation`,
  });
  return context;
};

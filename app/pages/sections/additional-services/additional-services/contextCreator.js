import manifest from './manifest.json';

export const getContext = ({ orderId, orderDescription }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
});

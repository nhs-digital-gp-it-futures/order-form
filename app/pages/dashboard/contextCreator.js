import manifest from './manifest.json';

export const getContext = ({ orgId }) => ({
  ...manifest,
  title: `${orgId} orders`,
});

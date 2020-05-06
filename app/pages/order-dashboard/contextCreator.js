import neworderPageManifest from './neworder/manifest.json';

export const getContext = ({ pageName }) => ({
  ...neworderPageManifest,
  pageName,
});

import neworderPageManifest from './neworder/manifest.json';
import { baseUrl } from '../../config';

export const getContext = ({ pageName }) => ({
  ...neworderPageManifest,
  backLinkHref: `${baseUrl}/organisation`,
  pageName,
});

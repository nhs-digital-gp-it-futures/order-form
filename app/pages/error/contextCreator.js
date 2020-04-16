import manifest from './manifest.json';
import config from '../../config';

export const getContext = error => ({
  ...manifest,
  error: {
    status: error && error.status ? error.status : manifest.error.status,
    backLinkText: error && error.backLinkText ? error.backLinkText : manifest.error.backLinkText,
    backLinkHref: error && error.backLinkHref ? error.backLinkHref : `${config.baseUrl}/`,
    title: error && error.title ? error.title : manifest.error.title,
    description: error && error.description ? error.description : manifest.error.description,
  },
});

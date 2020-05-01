import { oidcBaseUri } from './config';

const endpoints = {
  getIdentityApiHealth: () => `${oidcBaseUri}/health/ready`,
};

export const getEndpoint = ({ endpointLocator, options }) => endpoints[endpointLocator](options);

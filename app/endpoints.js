import {
  identityServerUrl,
} from './config';

const endpoints = {
  identity: {
    getApiHealth: () => `${identityServerUrl}/health/ready`,
  },
};

export const getEndpoint = ({ api, endpointLocator, options }) => (
  endpoints[api][endpointLocator](options)
);

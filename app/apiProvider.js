import axios from 'axios';
import { oidcBaseUri } from './config';
import { logger } from './logger';

const endpoints = {
  getIdentityApiHealth: () => `${oidcBaseUri}/health/ready`,
};

const getHeaders = accessToken => (accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {});

export const getData = async ({ endpointLocator, options, accessToken }) => {
  const endpoint = endpoints[endpointLocator](options);
  logger.info(`api called: [GET] ${endpoint}`);

  const response = await axios.get(endpoint, getHeaders(accessToken));
  return response.data || null;
};

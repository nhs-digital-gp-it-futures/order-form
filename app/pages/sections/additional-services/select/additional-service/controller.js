import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../../endpoints';
import { logger } from '../../../../../logger';
import { getContext } from './contextCreator';

export const getAdditionalServicePageContext = params => getContext(params);

export const findAdditionalServices = async ({ accessToken }) => {
  const endpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getAdditionalServices' });
  const { additionalServices } = await getData({ endpoint, accessToken, logger });
  logger.info(`Found ${additionalServices.length} additional service(s).`);

  return additionalServices;
};

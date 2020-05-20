import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getCallOffOrderingPartyContext = async ({ orderId, accessToken }) => {
  const callOffOrgDataEndpoint = getEndpoint({ endpointLocator: 'getCallOffOrderingParty', options: { orderId } });
  const callOffOrgData = await getData({ endpoint: callOffOrgDataEndpoint, accessToken, logger });

  if (callOffOrgData) {
    logger.info(`Call off ordering party found in ORDAPI for ${orderId}: ${callOffOrgData}`);
    return getContext({ orderId, data: callOffOrgData });
  }
  logger.error(`No call off ordering party data returned from ORDAPI for ${orderId}`);
  throw new Error();
};

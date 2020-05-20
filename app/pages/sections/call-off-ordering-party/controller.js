import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getCallOffOrderingPartyContext = async ({ orderId, orgId, accessToken }) => {
  try {
    const callOffOrgDataEndpoint = getEndpoint({ endpointLocator: 'getCallOffOrderingParty', options: { orderId } });
    const callOffOrgData = await getData({ endpoint: callOffOrgDataEndpoint, accessToken, logger });

    if (callOffOrgData) {
      logger.info(`Call off ordering party found in ORDAPI for ${orderId}: ${callOffOrgData}`);
      return getContext({ orderId, data: callOffOrgData });
    }
    logger.error(`No call off ordering party data returned from ORDAPI for ${orderId}`);
    throw new Error();
  } catch (err) {
    logger.info(`No call off ordering party found in ORDAPI for ${orderId}. ${err}`);

    try {
      const orgDataEndpoint = getEndpoint({ endpointLocator: 'getOrganisationById', options: { orgId } });
      const orgData = await getData({ endpoint: orgDataEndpoint, accessToken, logger });
      // const orgData = mockOrgData;
      logger.info(`Organisation with id: ${orgId} found`);
      return getContext({ orderId, data: orgData });
    } catch (error) {
      logger.error(`No organisation data returned from OAPI for id: ${orgId}. ${err}`);
      throw new Error();
    }
  }
};

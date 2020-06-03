import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getServiceRecipientsContext = async ({ orderId, orgId, accessToken }) => {
  const serviceRecipientEndpoint = getEndpoint({ endpointLocator: 'getServiceRecipientsFromOapi', options: { orgId } });
  const organisationData = await getData({
    endpoint: serviceRecipientEndpoint,
    accessToken,
    logger,
  });
  logger.info(`Service recipients for organisation with id: ${orgId} found in OAPI. ${organisationData}`);
  return getContext({ orderId });
};

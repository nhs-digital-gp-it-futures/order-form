import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getCallOffOrderingPartyEndpoint = (orderId) => (
  `${orderApiUrl}/api/v1/orders/${orderId}/sections/ordering-party`
);

export const getCallOffOrderingParty = async ({ orderId, accessToken }) => {
  const endpoint = getCallOffOrderingPartyEndpoint(orderId);
  const callOffOrderingPartyData = await getData({ endpoint, accessToken, logger });
  logger.info(`Call off ordering party returned in ORDAPI for ${orderId}`);

  return callOffOrderingPartyData;
};

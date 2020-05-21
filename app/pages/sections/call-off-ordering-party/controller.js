import { getData, putData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

const formatPutData = data => ({
  organisation: {
    name: data.name,
    odsCode: data.odsCode,
    address: {
      line1: data.line1,
      line2: data.line2,
      line3: data.line3,
      line4: data.line4,
      line5: data.line5,
      town: data.town,
      county: data.county,
      postcode: data.postcode,
      country: data.country,
    },
  },
  primaryContact: {
    firstName: data.firstName,
    lastName: data.lastName,
    emailAddress: data.emailAddress,
    telephoneNumber: data.telephoneNumber,
  },
});

export const getCallOffOrderingPartyContext = async ({ orderId, orgId, accessToken }) => {
  try {
    const callOffOrgDataEndpoint = getEndpoint({ endpointLocator: 'getCallOffOrderingParty', options: { orderId } });
    const callOffOrgData = await getData({ endpoint: callOffOrgDataEndpoint, accessToken, logger });

    if (callOffOrgData) {
      logger.info(`Call off ordering party found in ORDAPI for ${orderId}`);
      return getContext({ orderId, data: callOffOrgData.organisation });
    }
  } catch (err) {
    logger.info(`No call off ordering party found in ORDAPI for ${orderId}. ${err}`);

    try {
      const orgDataEndpoint = getEndpoint({ endpointLocator: 'getOrganisationById', options: { orgId } });
      const orgData = await getData({ endpoint: orgDataEndpoint, accessToken, logger });
      logger.info(`Organisation with id: ${orgId} found in OAPI`);
      return getContext({ orderId, data: orgData });
    } catch (error) {
      logger.error(`No organisation data returned from OAPI for id: ${orgId}. ${err}`);
      throw new Error();
    }
  }
  throw new Error();
};

export const putCallOffOrderingParty = async ({
  orgId, orderId, data, accessToken,
}) => {
  const endpoint = getEndpoint({ endpointLocator: 'putOrderingParty', options: { orderId } });
  const body = formatPutData(data);
  try {
    await putData({
      endpoint,
      body,
      organisationId: orgId,
      accessToken,
      logger,
    });

    logger.info(`Call off ordering party updated - order id: ${orderId}, ${JSON.stringify(data)}`);
    return { success: true };
  } catch (err) {
    logger.error('Error updating call-off-ordering-party for order');
    throw new Error();
  }
};

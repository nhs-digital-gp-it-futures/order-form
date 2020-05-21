import { getData, putData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

const formatPutData = data => ({
  organisation: {
    name: data.name ? data.name.trim() : null,
    odsCode: data.odsCode ? data.odsCode.trim() : null,
    address: {
      line1: data.line1 ? data.line1.trim() : null,
      line2: data.line2 ? data.line2.trim() : null,
      line3: data.line3 ? data.line3.trim() : null,
      line4: data.line4 ? data.line4.trim() : null,
      line5: data.line5 ? data.line5.trim() : null,
      town: data.town ? data.town.trim() : null,
      county: data.county ? data.county.trim() : null,
      postcode: data.postcode ? data.postcode.trim() : null,
      country: data.country ? data.country.trim() : null,
    },
  },
  primaryContact: {
    firstName: data.firstName ? data.firstName.trim() : null,
    lastName: data.lastName ? data.lastName.trim() : null,
    emailAddress: data.emailAddress ? data.emailAddress.trim() : null,
    telephoneNumber: data.telephoneNumber ? data.telephoneNumber.trim() : null,
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

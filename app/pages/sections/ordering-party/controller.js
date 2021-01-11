import { getContext, getErrorContext } from './contextCreator';
import { getCallOffOrderingParty } from '../../../helpers/api/ordapi/getCallOffOrderingParty';
import { logger } from '../../../logger';
import { getOrganisation } from '../../../helpers/api/oapi/getOrganisation';

const formatFormData = (data) => ({
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
  primaryContact: {
    firstName: data.firstName ? data.firstName.trim() : null,
    lastName: data.lastName ? data.lastName.trim() : null,
    emailAddress: data.emailAddress ? data.emailAddress.trim() : null,
    telephoneNumber: data.telephoneNumber ? data.telephoneNumber.trim() : null,
  },
});

export const getCallOffOrderingPartyContext = async ({ orderId, orgId, accessToken }) => {
  const callOffOrgData = await getCallOffOrderingParty({ orderId, accessToken });
  if (callOffOrgData && callOffOrgData.name) {
    logger.info(`Call off ordering party found in ORDAPI for ${orderId}`);
    return getContext({
      orderId,
      orgData: callOffOrgData,
    });
  }
  logger.info(`No call off ordering party found in ORDAPI for ${orderId}.`);
  try {
    return getContext({
      orderId,
      orgData: await getOrganisation({ orgId, accessToken }),
    });
  } catch (error) {
    logger.error(`No organisation data returned from OAPI for id: ${orgId}. ${error}`);
    throw new Error();
  }
};

export const getCallOffOrderingPartyErrorContext = async (params) => {
  const formattedData = formatFormData(params.data);

  const updatedParams = {
    ...params,
    data: formattedData,
  };

  return getErrorContext(updatedParams);
};

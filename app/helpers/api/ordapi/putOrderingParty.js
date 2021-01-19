import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

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

const getPutOrderingPartyEndpoint = (orderId) => (
  `${orderApiUrl}/api/v1/orders/${orderId}/sections/ordering-party`
);

export const putOrderingParty = async ({
  orderId, data, accessToken,
}) => {
  const endpoint = getPutOrderingPartyEndpoint(orderId);
  const body = formatFormData(data);

  try {
    await putData({
      endpoint,
      body,
      accessToken,
      logger,
    });
    logger.info(`Call off ordering party updated - order id: ${orderId}, ${JSON.stringify(data)}`);
    return { success: true };
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      return err.response.data;
    }
    logger.error('Error updating ordering-party for order');
    throw new Error();
  }
};

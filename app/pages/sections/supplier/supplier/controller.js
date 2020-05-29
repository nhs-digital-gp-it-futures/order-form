import { getData, putData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { getContext } from './contextCreator';
import { logger } from '../../../../logger';

const formatPutData = data => ({
  supplier: {
    name: data.name ? data.name.trim() : undefined,
    address: {
      line1: data.line1 ? data.line1.trim() : undefined,
      line2: data.line2 ? data.line2.trim() : undefined,
      line3: data.line3 ? data.line3.trim() : undefined,
      line4: data.line4 ? data.line4.trim() : undefined,
      line5: data.line5 ? data.line5.trim() : undefined,
      town: data.town ? data.town.trim() : undefined,
      county: data.county ? data.county.trim() : undefined,
      postcode: data.postcode ? data.postcode.trim() : undefined,
      country: data.country ? data.country.trim() : undefined,
    },
    primaryContact: {
      firstName: data.firstName ? data.firstName.trim() : undefined,
      lastName: data.lastName ? data.lastName.trim() : undefined,
      emailAddress: data.emailAddress ? data.emailAddress.trim() : undefined,
      telephoneNumber: data.telephoneNumber ? data.telephoneNumber.trim() : undefined,
    },
  },
});

export const getSupplierPageContext = async ({ orderId, supplierId, accessToken }) => {
  const getSupplierDataEndpoint = getEndpoint({ endpointLocator: 'getSupplier', options: { supplierId } });
  const supplierData = await getData({ endpoint: getSupplierDataEndpoint, accessToken, logger });

  const context = getContext({ orderId, supplierData });
  return context;
};

export const putSupplier = async ({
  orderId, data, accessToken,
}) => {
  const endpoint = getEndpoint({ endpointLocator: 'putSupplier', options: { orderId } });
  const body = formatPutData(data);
  try {
    await putData({
      endpoint,
      body,
      accessToken,
      logger,
    });
    logger.info(`Supplier updated - order id: ${orderId}, ${JSON.stringify(data)}`);
    return { success: true };
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      return err.response.data;
    }
    logger.error('Error updating supplier for order');
    throw new Error();
  }
};

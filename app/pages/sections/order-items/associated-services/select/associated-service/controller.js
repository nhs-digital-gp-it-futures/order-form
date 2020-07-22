import { getContext } from './contextCreator';
import { getCatalogueItems } from '../../../../../../helpers/api/bapi/getCatalogueItems';
import { getSupplier } from '../../../../../../helpers/api/ordapi/getSupplier';

export const getAssociatedServicePageContext = params => getContext(params);

const getSupplierId = async ({
  req,
  sessionManager,
  accessToken,
  logger,
}) => {
  const selectedSupplier = sessionManager.getFromSession({ req, key: 'selectedSupplier' });
  if (selectedSupplier) {
    return selectedSupplier;
  }

  const { orderId } = req.params;
  const { supplierId } = await getSupplier({ orderId, accessToken, logger });

  sessionManager.saveToSession({ req, key: 'selectedSupplier', value: supplierId });

  return supplierId;
};

export const findAssociatedServices = async ({
  req,
  sessionManager,
  accessToken,
  logger,
}) => {
  const selectedSupplier = await getSupplierId({
    req,
    sessionManager,
    accessToken,
    logger,
  });

  return getCatalogueItems({ supplierId: selectedSupplier, catalogueItemType: 'AssociatedService' });
};

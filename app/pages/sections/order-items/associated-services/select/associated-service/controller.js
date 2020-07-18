import { getContext } from './contextCreator';
import { getCatalogueItems } from '../../../../../../helpers/api/bapi/getCatalogueItems';

export const getAssociatedServicePageContext = params => getContext(params);

export const findAssociatedServices = async ({ req, sessionManager }) => {
  const selectedSupplier = sessionManager.getFromSession({ req, key: 'selectedSupplier' });
  const { associatedServices } = await getCatalogueItems({ supplierId: selectedSupplier, catalogueItemType: 'AssociatedService' });

  return associatedServices;
};

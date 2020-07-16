import { logger } from '../../logger';

export const findSelectedCatalogueItemInSession = ({
  req, selectedItemId, sessionManager, catalogueItemsKey,
}) => {
  const additionalServices = sessionManager.getFromSession({ req, key: catalogueItemsKey });
  const findCallback = a => a.additionalServiceId === selectedItemId;
  const selectedItem = additionalServices.find(findCallback);

  if (!selectedItem) {
    logger.error(`Unable to find selected item ${selectedItemId} in session`);
    throw new Error();
  }

  return selectedItem;
};

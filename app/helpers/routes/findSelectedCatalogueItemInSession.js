import { logger } from '../../logger';

const findByType = {
  additionalServices: catalogueItem => catalogueItem.additionalServiceId,
  catalogueSolutions: catalogueItem => catalogueItem.id,
};

export const findSelectedCatalogueItemInSession = ({
  req, selectedItemId, sessionManager, catalogueItemsKey,
}) => {
  const additionalServices = sessionManager.getFromSession({ req, key: catalogueItemsKey });
  const findCallback = a => findByType[catalogueItemsKey](a) === selectedItemId;
  const selectedItem = additionalServices.find(findCallback);

  if (!selectedItem) {
    logger.error(`Unable to find selected item ${selectedItemId} in session`);
    throw new Error();
  }

  return selectedItem;
};

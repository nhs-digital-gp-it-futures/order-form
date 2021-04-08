import {
  backLinkHref, deleteButtonLink, editRecipientsLink, getContext,
} from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/routes/getOrderDescription';

const KeyCatalogueSolution = 'Catalogue Solution';
const KeyAdditionalService = 'Additional Service';

export const getAdditionalServicesPageContext = async ({
  req,
  orderId,
  catalogueItemType,
  accessToken,
  sessionManager,
  logger,
}) => {
  const additionalServiceOrderItemsData = await getOrderItems({
    orderId,
    catalogueItemType,
    accessToken,
  });

  const orderDescriptionData = await getOrderDescription({
    req,
    sessionManager,
    accessToken,
    logger,
  });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData || '',
    orderItems: additionalServiceOrderItemsData,
  });
};

export const getBackLinkHref = (req, orderId) => backLinkHref({ req, orderId });

export const setAdditionalServicesLinks = (req, context, orderId, orderItemId, solutionName) => {
  context.backLinkHref = backLinkHref({ req, orderId });
  context.deleteButton.altText = context.deleteButton.altText
    .replace(KeyCatalogueSolution, KeyAdditionalService);
  context.deleteButton.href = deleteButtonLink({ orderId, orderItemId, solutionName });
  context.deleteButton.text = context.deleteButton.text
    .replace(KeyCatalogueSolution, KeyAdditionalService);
  context.editButton.href = editRecipientsLink(orderId);
};

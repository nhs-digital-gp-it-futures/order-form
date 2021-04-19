import {
  backLinkHref, deleteButtonLink, editRecipientsLink, getContext,
} from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/routes/getOrderDescription';
import { baseUrl } from '../../../../../config';

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

export const getBackLinkHref = (req, selectedPrice, orderId) => backLinkHref({
  req, selectedPrice, orderId,
});

export const updateContext = (req, selectedPrice, context, orderId, orderItemId, solutionName) => {
  const submittedOrderItemId = req.query.submitted;
  context.backLinkHref = (submittedOrderItemId !== undefined
    && submittedOrderItemId !== 'neworderitem')
    ? `${baseUrl}/organisation/${orderId}/additional-services`
    : backLinkHref({ req, selectedPrice, orderId });

  context.deleteButton.altText = context.deleteButton.altText
    .replace(KeyCatalogueSolution, KeyAdditionalService);

  context.deleteButton.href = deleteButtonLink({ orderId, orderItemId, solutionName });

  context.deleteButton.text = context.deleteButton.text
    .replace(KeyCatalogueSolution, KeyAdditionalService);

  context.editButton.href = editRecipientsLink(orderId);

  if (context.questions && context.questions.price && !context.questions.price.data) {
    context.questions.price.data = '0.00';
  }
};

export const updateContextPost = (req, selectedPrice, context, orderId, solutionName) => {
  const { referer } = req.headers;
  const catalogueItemId = referer ? referer.split('/').pop() : '';

  context.backLinkHref = catalogueItemId.toLowerCase() === 'neworderitem'
    ? backLinkHref({ req, selectedPrice, orderId })
    : `${baseUrl}/organisation/${orderId}/additional-services`;

  context.deleteButton.altText = context.deleteButton.altText
    .replace(KeyCatalogueSolution, KeyAdditionalService);

  context.deleteButton.href = deleteButtonLink({ orderId, catalogueItemId, solutionName });

  context.deleteButton.text = context.deleteButton.text
    .replace(KeyCatalogueSolution, KeyAdditionalService);

  context.editButton.href = editRecipientsLink(orderId);
};

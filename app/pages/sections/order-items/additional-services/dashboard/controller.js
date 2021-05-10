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
  odsCode,
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
    odsCode,
  });
};

export const getBackLinkHref = (req, selectedPrice, orderId, odsCode) => backLinkHref({
  req, selectedPrice, orderId, odsCode,
});

export const updateContext = (
  req, selectedPrice, context, orderId, catalogueItemId, solutionName, catalogueItemExists, odsCode,
) => {
  const submittedOrderItemId = req.query.submitted;
  context.backLinkHref = (submittedOrderItemId !== undefined
    && submittedOrderItemId !== 'neworderitem' && !catalogueItemExists)
    ? `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services`
    : backLinkHref({
      req, selectedPrice, orderId, catalogueItemExists, odsCode,
    });

  context.deleteButton.altText = context.deleteButton.altText
    .replace(KeyCatalogueSolution, KeyAdditionalService);

  context.deleteButton.href = deleteButtonLink({
    orderId, catalogueItemId, solutionName, odsCode,
  });

  context.deleteButton.text = context.deleteButton.text
    .replace(KeyCatalogueSolution, KeyAdditionalService);

  context.editButton.href = editRecipientsLink(orderId, odsCode);

  if (context.questions && context.questions.price && !context.questions.price.data) {
    context.questions.price.data = '0.00';
  }
};

export const updateContextPost = (req, selectedPrice, context, orderId, solutionName, odsCode) => {
  const { referer } = req.headers;
  const catalogueItemId = referer ? referer.split('/').pop() : '';

  context.backLinkHref = catalogueItemId.toLowerCase() === 'neworderitem'
    ? backLinkHref({ req, selectedPrice, orderId })
    : `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services`;

  context.deleteButton.altText = context.deleteButton.altText
    .replace(KeyCatalogueSolution, KeyAdditionalService);

  context.deleteButton.href = deleteButtonLink({
    orderId, catalogueItemId, solutionName, odsCode,
  });

  context.deleteButton.text = context.deleteButton.text
    .replace(KeyCatalogueSolution, KeyAdditionalService);

  context.editButton.href = editRecipientsLink(orderId, odsCode);
};

import { getContext, getErrorContext } from './contextCreator';
import { getDateErrors } from '../../../../../../helpers/controllers/getDateErrors';
import { destructureDate } from '../../../../../../helpers/common/dateFormatter';

const generateFormData = (commencementDate) => {
  if (commencementDate) {
    const [day, month, year] = destructureDate(commencementDate);
    return ({
      'deliveryDate-day': day,
      'deliveryDate-month': month,
      'deliveryDate-year': year,
    });
  }
  return undefined;
};

export const getDeliveryDateContext = async ({
  orderId, itemName, commencementDate, manifest, orderType, odsCode,
}) => getContext({
  orderId,
  itemName,
  data: generateFormData(commencementDate),
  manifest,
  orderType,
  odsCode,
});

export const validateDeliveryDateForm = ({ data }) => {
  const errors = [];
  const dateErrors = getDateErrors('deliveryDate', data);
  if (dateErrors) {
    errors.push(dateErrors);
  }

  return errors;
};

export const getDeliveryDateErrorPageContext = async ({
  orderId, itemName, data, validationErrors, manifest,
}) => getErrorContext({
  orderId,
  itemName,
  data,
  validationErrors,
  manifest,
});

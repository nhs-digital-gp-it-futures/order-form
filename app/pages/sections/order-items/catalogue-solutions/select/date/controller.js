import { getContext, getErrorContext } from './contextCreator';
import { getDateErrors } from '../../../../../../helpers/controllers/getDateErrors';
import { destructureDate } from '../../../../../../helpers/common/dateFormatter';

const generateFormData = (commencementDate) => {
  if (commencementDate) {
    const [day, month, year] = destructureDate(commencementDate);
    return ({
      'plannedDeliveryDate-day': day,
      'plannedDeliveryDate-month': month,
      'plannedDeliveryDate-year': year,
    });
  }
  return undefined;
};

export const getDeliveryDateContext = async ({
  orderId, itemName, commencementDate,
}) => getContext({
  orderId,
  itemName,
  data: generateFormData(commencementDate),
});

export const validateDeliveryDateForm = ({ data }) => {
  const errors = [];
  const dateErrors = getDateErrors('plannedDeliveryDate', data);
  if (dateErrors) {
    errors.push(dateErrors);
  }

  return errors;
};

export const getDeliveryDateErrorPageContext = async ({
  orderId, itemName, data, validationErrors,
}) => getErrorContext({
  orderId,
  itemName,
  data,
  validationErrors,
});

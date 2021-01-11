import { getContext, getErrorContext } from './contextCreator';
import { getDateErrors } from '../../../helpers/controllers/getDateErrors';
import { destructureDate } from '../../../helpers/common/dateFormatter';
import { getCommencementDate } from '../../../helpers/api/ordapi/getCommencementDate';

const generateFormData = (commencementDateData) => {
  if (commencementDateData.commencementDate) {
    const [day, month, year] = destructureDate(commencementDateData.commencementDate);
    return ({
      'commencementDate-day': day,
      'commencementDate-month': month,
      'commencementDate-year': year,
    });
  }
  return undefined;
};

export const getCommencementDateContext = async ({ orderId, accessToken }) => {
  const commencementDateData = await getCommencementDate({ orderId, accessToken });

  return getContext({
    orderId,
    data: generateFormData(commencementDateData),
  });
};

export const validateCommencementDateForm = ({ data }) => {
  const errors = [];
  const dateErrors = getDateErrors('commencementDate', data);
  if (dateErrors) {
    errors.push(dateErrors);
  }

  return errors;
};

export const getCommencementDateErrorContext = async (params) => getErrorContext(params);

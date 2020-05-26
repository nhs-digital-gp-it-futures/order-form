import { getContext } from './contextCreator';
import { getDateErrors } from './getDateErrors';

export const getCommencementDateContext = async parmas => getContext(parmas);

export const putCommencementDate = async ({ data }) => {
  const errors = [getDateErrors(data)];
  if (errors[0]) return { success: false, errors };
  return { success: true };
};

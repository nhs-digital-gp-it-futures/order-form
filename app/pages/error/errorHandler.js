import { baseUrl } from '../../config';

export const errorHandler = (err) => {
  const formattedError = {
    status: err && err.status ? err.status : 400,
    message: err && err.message ? err.message : 'Something went wrong',
  };
  if (err && err.code === 'ENOENT') {
    formattedError.message = 'Incorrect url (section) - please check it is valid and try again';
  }
  if (err && err.response && err.response.data && err.response.data.errors) {
    formattedError.status = err.response.status;
    formattedError.message = `${err.response.data.errors[0]} ${err.response.statusText}`;
  }
  formattedError.backLinkHref = `${baseUrl}/`;

  return formattedError;
};

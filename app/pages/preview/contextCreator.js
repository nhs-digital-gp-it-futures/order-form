import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/dateFormatter';

const getCurrentDate = () => formatDate(new Date(Date.now()));

export const getContext = ({ orderId, orderData }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription: orderData.description,
  dateSummaryCreated: getCurrentDate(),
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});

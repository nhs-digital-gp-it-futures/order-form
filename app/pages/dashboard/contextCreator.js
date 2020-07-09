import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/common/dateFormatter';

export const getContext = ({ orgName, ordersData = [] }) => {
  const formattedOrders = ordersData.reduce((acc, order) => {
    const formattedOrder = [
      {
        data: order.orderId,
        href: `${baseUrl}/organisation/${order.orderId}`,
        dataTestId: `${order.orderId}-id`,
      },
      {
        data: order.description,
        dataTestId: `${order.orderId}-description`,
      },
      {
        data: order.lastUpdatedBy,
        dataTestId: `${order.orderId}-lastUpdatedBy`,
      },
      {
        data: formatDate(order.lastUpdated),
        dataTestId: `${order.orderId}-lastUpdated`,
      },
      {
        data: formatDate(order.dateCreated),
        dataTestId: `${order.orderId}-dateCreated`,
      },
    ];
    if (order.status === 'Submitted') acc.submittedOrders.push(formattedOrder);
    else acc.unsubmittedOrders.push(formattedOrder);
    return acc;
  }, { submittedOrders: [], unsubmittedOrders: [] });

  return ({
    ...manifest,
    title: `${orgName} orders`,
    newOrderButtonHref: `${baseUrl}/organisation/neworder`,
    proxyLinkHref: '#',
    submittedOrders: formattedOrders.submittedOrders,
    unsubmittedOrders: formattedOrders.unsubmittedOrders,
  });
};

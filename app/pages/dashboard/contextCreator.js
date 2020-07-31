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
    if (order.status.toLowerCase() === 'complete') acc.completeOrders.push(formattedOrder);
    else acc.incompleteOrders.push(formattedOrder);
    return acc;
  }, { completeOrders: [], incompleteOrders: [] });

  return ({
    ...manifest,
    title: `${orgName} orders`,
    newOrderButtonHref: `${baseUrl}/organisation/neworder`,
    proxyLinkHref: '#',
    completeOrders: formattedOrders.completeOrders,
    incompleteOrders: formattedOrders.incompleteOrders,
  });
};

import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/dateFormatter';

export const getContext = ({ orgId, ordersData = [] }) => {
  const formattedOrders = ordersData.reduce((acc, order) => {
    const formattedOrder = [
      {
        data: order.orderId,
        href: `${baseUrl}/organisation/${order.orderId}`,
        dataTestId: `${order.orderId}-id`,
      },
      {
        data: order.orderDescription,
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
    title: `${orgId} orders`,
    newOrderButtonHref: `${baseUrl}/organisation/neworder`,
    proxyLinkHref: '#',
    submittedOrders: formattedOrders.submittedOrders,
    unsubmittedOrders: formattedOrders.unsubmittedOrders,
  });
};

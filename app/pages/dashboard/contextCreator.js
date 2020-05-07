import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/dateFormatter';

export const getContext = ({ orgId, ordersData = [] }) => {
  const formattedOrders = ordersData.reduce((acc, order) => {
    const formattedOrder = [
      {
        data: order.orderId,
        href: `${baseUrl}/organisation/${order.orderId}`,
        dataTestId: `id-${order.orderId}`,
      },
      {
        data: order.orderDescription,
        dataTestId: `description-${order.orderId}`,
      },
      {
        data: order.lastUpdatedBy,
        dataTestId: `lastUpdatedBy-${order.orderId}`,
      },
      {
        data: formatDate(order.lastUpdated),
        dataTestId: `lastUpdated-${order.orderId}`,
      },
      {
        data: formatDate(order.dateCreated),
        dataTestId: `dateCreated-${order.orderId}`,
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

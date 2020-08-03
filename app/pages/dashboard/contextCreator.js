import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/common/dateFormatter';

export const getContext = ({ orgName, ordersData = [] }) => {
  const { cellInfo } = manifest;

  const formattedOrders = ordersData.reduce((acc, order) => {
    const formattedOrder = [
      {
        data: order.orderId,
        href: `${baseUrl}/organisation/${order.orderId}`,
        dataTestId: `${order.orderId}-id`,
        classes: cellInfo.orderId.classes,
      },
      {
        data: order.description,
        dataTestId: `${order.orderId}-description`,
        classes: cellInfo.description.classes,
      },
      {
        data: order.lastUpdatedBy,
        dataTestId: `${order.orderId}-lastUpdatedBy`,
        classes: cellInfo.lastUpdatedBy.classes,
      },
      {
        data: formatDate(order.lastUpdated),
        dataTestId: `${order.orderId}-lastUpdated`,
        classes: cellInfo.lastUpdated.classes,
      },
      {
        data: formatDate(order.dateCreated),
        dataTestId: `${order.orderId}-dateCreated`,
        classes: cellInfo.dateCreated.classes,
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

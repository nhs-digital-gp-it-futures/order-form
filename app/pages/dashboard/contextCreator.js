import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/common/dateFormatter';

const formatOrderData = ({ ordersData = [] }) => ordersData.reduce((acc, order) => {
  const isComplete = order.status.toLowerCase() === 'complete';

  const cellInfo = isComplete
    ? manifest.completeOrdersTable.cellInfo
    : manifest.incompleteOrdersTable.cellInfo;

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
      data: isComplete ? formatDate(order.dateCompleted) : formatDate(order.lastUpdated),
      dataTestId: isComplete ? `${order.orderId}-dateCompleted` : `${order.orderId}-lastUpdated`,
      classes: isComplete ? cellInfo.dateCompleted.classes : cellInfo.lastUpdated.classes,
    },
    {
      data: formatDate(order.dateCreated),
      dataTestId: `${order.orderId}-dateCreated`,
      classes: cellInfo.dateCreated.classes,
    },
  ];

  if (isComplete) {
    formattedOrder.push({
      data: order.automaticallyProcessed ? 'Yes' : 'No',
      dataTestId: `${order.orderId}-automaticallyProcessed`,
      classes: cellInfo.automaticallyProcessed.classes,
    });

    acc.completeOrders.push(formattedOrder);
  } else {
    acc.incompleteOrders.push(formattedOrder);
  }

  return acc;
}, { completeOrders: [], incompleteOrders: [] });

export const getContext = ({ orgName, ordersData = [] }) => {
  const formattedOrders = formatOrderData({ ordersData });

  return ({
    ...manifest,
    title: `${orgName} orders`,
    newOrderButtonHref: `${baseUrl}/organisation/neworder`,
    proxyLinkHref: '#',
    completeOrders: formattedOrders.completeOrders,
    incompleteOrders: formattedOrders.incompleteOrders,
  });
};

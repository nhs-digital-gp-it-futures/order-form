import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/common/dateFormatter';

const generateIncompletedOrdersTable = (incompletedOrders, incompleteOrdersTable) => {
  const items = incompletedOrders.map((order) => {
    const columns = [
      {
        data: order.orderId,
        href: `${baseUrl}/organisation/${order.orderId}`,
        dataTestId: `${order.orderId}-id`,
        classes: incompleteOrdersTable.cellInfo.orderId.classes,
      },
      {
        data: order.description,
        dataTestId: `${order.orderId}-description`,
        classes: incompleteOrdersTable.cellInfo.description.classes,
      },
      {
        data: order.lastUpdatedBy,
        dataTestId: `${order.orderId}-lastUpdatedBy`,
        classes: incompleteOrdersTable.cellInfo.lastUpdatedBy.classes,
      },
      {
        data: formatDate(order.lastUpdated),
        dataTestId: `${order.orderId}-lastUpdated`,
        classes: incompleteOrdersTable.cellInfo.lastUpdated.classes,
      },
      {
        data: formatDate(order.dateCreated),
        dataTestId: `${order.orderId}-dateCreated`,
        classes: incompleteOrdersTable.cellInfo.dateCreated.classes,
      },
    ];

    return columns;
  });

  return {
    ...incompleteOrdersTable,
    items,
  };
};

const generateCompletedOrdersTable = (completedOrders, completeOrdersTable) => {
  const items = completedOrders.map((order) => {
    const columns = [
      {
        data: order.orderId,
        href: `${baseUrl}/organisation/${order.orderId}`,
        dataTestId: `${order.orderId}-id`,
        classes: completeOrdersTable.cellInfo.orderId.classes,
      },
      {
        data: order.description,
        dataTestId: `${order.orderId}-description`,
        classes: completeOrdersTable.cellInfo.description.classes,
      },
      {
        data: order.lastUpdatedBy,
        dataTestId: `${order.orderId}-lastUpdatedBy`,
        classes: completeOrdersTable.cellInfo.lastUpdatedBy.classes,
      },
      {
        data: formatDate(order.dateCompleted),
        dataTestId: `${order.orderId}-dateCompleted`,
        classes: completeOrdersTable.cellInfo.dateCompleted.classes,
      },
      {
        data: formatDate(order.dateCreated),
        dataTestId: `${order.orderId}-dateCreated`,
        classes: completeOrdersTable.cellInfo.dateCreated.classes,
      },
      {
        data: order.automaticallyProcessed ? 'Yes' : 'No',
        dataTestId: `${order.orderId}-automaticallyProcessed`,
        classes: completeOrdersTable.cellInfo.automaticallyProcessed.classes,
      },
    ];

    return columns;
  });

  return {
    ...completeOrdersTable,
    items,
  };
};

export const getContext = ({ orgName, completedOrders = [], incompletedOrders = [] }) => ({
  ...manifest,
  title: `${orgName} orders`,
  newOrderButtonHref: `${baseUrl}/organisation/neworder`,
  proxyLinkHref: '#',
  completeOrders: generateCompletedOrdersTable(
    completedOrders, manifest.completeOrdersTable,
  ),
  incompleteOrders: generateIncompletedOrdersTable(
    incompletedOrders, manifest.incompleteOrdersTable,
  ),
});

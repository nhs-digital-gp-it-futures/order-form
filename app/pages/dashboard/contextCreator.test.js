import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { getContext } from './contextCreator';

const mockOrdersData = [
  {
    orderId: 'order1',
    orderDescription: 'Some Order',
    lastUpdatedBy: 'Bob Smith',
    lastUpdated: '2020-05-06T09:29:52.4965647Z',
    dateCreated: '2020-05-06T09:29:52.4965653Z',
    status: 'Unsubmitted'
  },
  {
    orderId: 'order2',
    orderDescription: 'Some new order',
    lastUpdatedBy: 'Alice Smith',
    lastUpdated: '2020-06-06T09:29:52.49657Z',
    dateCreated: '2020-06-06T09:29:52.4965701Z',
    status: 'Submitted'
  }
];

describe('getContext', () => {
  it('should return the contents of the manifest', () => {
    const context = getContext({});
    expect(context.backlinkText).toEqual(manifest.backlinkText);
    expect(context.description).toEqual(manifest.description);
    expect(context.newOrderButtonText).toEqual(manifest.newOrderButtonText);
    expect(context.proxyLinkText).toEqual(manifest.proxyLinkText);
    expect(context.unsubmittedOrdersTableTitle).toEqual(manifest.unsubmittedOrdersTableTitle);
    expect(context.submittedOrdersTableTitle).toEqual(manifest.submittedOrdersTableTitle);
    expect(context.columnInfo).toEqual(manifest.columnInfo);
    expect(context.columnClass).toEqual(manifest.columnClass);
  });

  it('should construct title', () => {
    const context = getContext({ orgId: 'Org1' });
    expect(context.title).toEqual('Org1 orders');
  });

  it('should construct newOrderButtonHref', () => {
    const context = getContext({});
    expect(context.newOrderButtonHref).toEqual(`${baseUrl}/organisation/neworder`);
  });

  it('should construct proxyLinkHref', () => {
    const context = getContext({ orgId: 'Org1' });
    expect(context.proxyLinkHref).toEqual('#');
  });

// export const getContext = ({ orgId, ordersData = [] }) => {
//   const formattedOrders = ordersData.reduce((acc, order) => {
//     const formattedOrder = [
//       {
//         data: order.orderId,
//         href: `${baseUrl}/organisation/${order.orderId}`,
//         dataTestId: `id-${order.orderId}`,
//       },
//       {
//         data: order.orderDescription,
//         dataTestId: `description-${order.orderId}`,
//       },
//       {
//         data: order.lastUpdatedBy,
//         dataTestId: `lastUpdatedBy-${order.orderId}`,
//       },
//       {
//         data: formatDate(order.lastUpdated),
//         dataTestId: `lastUpdated-${order.orderId}`,
//       },
//       {
//         data: formatDate(order.dateCreated),
//         dataTestId: `dateCreated-${order.orderId}`,
//       },
//     ];
//     if (order.status === 'Submitted') acc.submittedOrders.push(formattedOrder);
//     else acc.unsubmittedOrders.push(formattedOrder);
//     return acc;
//   }, { submittedOrders: [], unsubmittedOrders: [] });

//   return ({
//     submittedOrders: formattedOrders.submittedOrders,
//     unsubmittedOrders: formattedOrders.unsubmittedOrders,
//   });
// };
  fdescribe('ordersData', () => {
    it('should format a submitted order correctly', () => {
      const context = getContext({ orgId: 'Org1', ordersData: mockOrdersData });
      expect(context.submittedOrders.length).toEqual(1);
      const submittedOrder1 = context.submittedOrders[0];
      expect(submittedOrder1[0].data).toEqual('order2');
      expect(submittedOrder1[0].href).toEqual(`${baseUrl}/organisation/order2`);
      expect(submittedOrder1[0].dataTestId).toEqual('id-order2');
      expect(submittedOrder1[1].data).toEqual('Some new order');
      expect(submittedOrder1[1].dataTestId).toEqual('description-order2');
      expect(submittedOrder1[2].data).toEqual('Alice Smith');
      expect(submittedOrder1[2].dataTestId).toEqual('lastUpdatedBy-order2');
      expect(submittedOrder1[3].data).toEqual('6 June 2020');
      expect(submittedOrder1[3].dataTestId).toEqual('lastUpdated-order2');
      expect(submittedOrder1[4].data).toEqual('6 June 2020');
      expect(submittedOrder1[4].dataTestId).toEqual('dateCreated-order2');
    });

    it('should format an unsubmitted order correctly', () => {
      const context = getContext({ orgId: 'Org1', ordersData: mockOrdersData });
      expect(context.unsubmittedOrders.length).toEqual(1);
      const unsubmittedOrder1 = context.unsubmittedOrders[0];
      expect(unsubmittedOrder1[0].data).toEqual('order1');
      expect(unsubmittedOrder1[0].href).toEqual(`${baseUrl}/organisation/order1`);
      expect(unsubmittedOrder1[0].dataTestId).toEqual('id-order1');
      expect(unsubmittedOrder1[1].data).toEqual('Some Order');
      expect(unsubmittedOrder1[1].dataTestId).toEqual('description-order1');
      expect(unsubmittedOrder1[2].data).toEqual('Bob Smith');
      expect(unsubmittedOrder1[2].dataTestId).toEqual('lastUpdatedBy-order1');
      expect(unsubmittedOrder1[3].data).toEqual('6 May 2020');
      expect(unsubmittedOrder1[3].dataTestId).toEqual('lastUpdated-order1');
      expect(unsubmittedOrder1[4].data).toEqual('6 May 2020');
      expect(unsubmittedOrder1[4].dataTestId).toEqual('dateCreated-order1');
    });
  });
});

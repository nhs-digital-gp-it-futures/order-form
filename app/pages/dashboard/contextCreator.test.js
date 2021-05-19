import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { getContext } from './contextCreator';

const incompletedOrders = [
  {
    orderId: 'order1',
    description: 'Some Order',
    lastUpdatedBy: 'Bob Smith',
    lastUpdated: '2020-05-06T09:29:52.4965647Z',
    dateCreated: '2020-05-06T09:29:52.4965653Z',
    status: 'Incomplete',
  },
];

const completedOrders = [
  {
    orderId: 'order2',
    description: 'Some new order',
    lastUpdatedBy: 'Alice Smith',
    dateCompleted: '2020-06-06T09:29:52.49657Z',
    dateCreated: '2020-06-06T09:29:52.4965701Z',
    status: 'Complete',
    onlyGMS: true,
  },
  {
    orderId: 'order3',
    status: 'Complete',
    onlyGMS: false,
  },
];
const odsCode = '03F';

describe('getContext', () => {
  const classes = 'nhsuk-u-font-size-16';

  it('should return the contents of the manifest', () => {
    const context = getContext({});
    expect(context.backLinkText).toEqual(manifest.backLinkText);
    expect(context.description).toEqual(manifest.description);
    expect(context.newOrderButtonText).toEqual(manifest.newOrderButtonText);
    expect(context.incompleteOrdersTableTitle).toEqual(manifest.incompleteOrdersTableTitle);
    expect(context.completeOrdersTableTitle).toEqual(manifest.completeOrdersTableTitle);
    expect(context.incompleteOrdersTable.columnInfo).toEqual(
      manifest.incompleteOrdersTable.columnInfo,
    );

    expect(context.completeOrdersTable.columnInfo).toEqual(manifest.completeOrdersTable.columnInfo);
  });

  it('should construct title', () => {
    const context = getContext({ orgName: 'Org1' });
    expect(context.title).toEqual('Org1');
  });

  it('should construct newOrderButtonHref', () => {
    const context = getContext({ odsCode });
    expect(context.newOrderButtonHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/neworder`);
  });

  describe('ordersData', () => {
    it('should format completed orders correctly', () => {
      const context = getContext({
        orgName: 'Org1', completedOrders, incompletedOrders, odsCode,
      });

      expect(context.completeOrders.items.length).toEqual(2);

      const completeOrder1 = context.completeOrders.items[0];
      expect(completeOrder1.length).toEqual(6);

      expect(completeOrder1[0].data).toEqual('order2');
      expect(completeOrder1[0].classes).toEqual(classes);
      expect(completeOrder1[0].href).toEqual(`${baseUrl}/organisation/${odsCode}/order/order2/summary`);
      expect(completeOrder1[0].dataTestId).toEqual('order2-id');
      expect(completeOrder1[1].data).toEqual('Some new order');
      expect(completeOrder1[1].classes).toEqual(classes);
      expect(completeOrder1[1].dataTestId).toEqual('order2-description');
      expect(completeOrder1[2].data).toEqual('Alice Smith');
      expect(completeOrder1[2].classes).toEqual(classes);
      expect(completeOrder1[2].dataTestId).toEqual('order2-lastUpdatedBy');
      expect(completeOrder1[3].data).toEqual('6 June 2020');
      expect(completeOrder1[3].classes).toEqual(classes);
      expect(completeOrder1[3].dataTestId).toEqual('order2-dateCompleted');
      expect(completeOrder1[4].data).toEqual('6 June 2020');
      expect(completeOrder1[4].classes).toEqual(classes);
      expect(completeOrder1[4].dataTestId).toEqual('order2-dateCreated');
      expect(completeOrder1[5].data).toEqual('Yes');
      expect(completeOrder1[5].classes).toEqual(classes);
      expect(completeOrder1[5].dataTestId).toEqual('order2-automaticallyProcessed');

      const completeOrder2 = context.completeOrders.items[1];
      expect(completeOrder2.length).toEqual(6);

      expect(completeOrder2[0].data).toEqual('order3');
      expect(completeOrder2[0].classes).toEqual(classes);
      expect(completeOrder2[0].href).toEqual(`${baseUrl}/organisation/${odsCode}/order/order3/summary`);
      expect(completeOrder2[0].dataTestId).toEqual('order3-id');
      expect(completeOrder2[5].data).toEqual('No');
      expect(completeOrder2[5].classes).toEqual(classes);
      expect(completeOrder2[5].dataTestId).toEqual('order3-automaticallyProcessed');
    });

    it('should format an incomplete order correctly', () => {
      const context = getContext({
        orgName: 'Org1', completedOrders, incompletedOrders, odsCode,
      });
      expect(context.incompleteOrders.items.length).toEqual(1);

      const incompleteOrder1 = context.incompleteOrders.items[0];
      expect(incompleteOrder1.length).toEqual(5);

      expect(incompleteOrder1[0].data).toEqual('order1');
      expect(incompleteOrder1[0].classes).toEqual(classes);
      expect(incompleteOrder1[0].href).toEqual(`${baseUrl}/organisation/${odsCode}/order/order1`);
      expect(incompleteOrder1[0].dataTestId).toEqual('order1-id');
      expect(incompleteOrder1[1].data).toEqual('Some Order');
      expect(incompleteOrder1[1].classes).toEqual(classes);
      expect(incompleteOrder1[1].dataTestId).toEqual('order1-description');
      expect(incompleteOrder1[2].data).toEqual('Bob Smith');
      expect(incompleteOrder1[2].classes).toEqual(classes);
      expect(incompleteOrder1[2].dataTestId).toEqual('order1-lastUpdatedBy');
      expect(incompleteOrder1[3].data).toEqual('6 May 2020');
      expect(incompleteOrder1[3].classes).toEqual(classes);
      expect(incompleteOrder1[3].dataTestId).toEqual('order1-lastUpdated');
      expect(incompleteOrder1[4].data).toEqual('6 May 2020');
      expect(incompleteOrder1[4].classes).toEqual(classes);
      expect(incompleteOrder1[4].dataTestId).toEqual('order1-dateCreated');
    });

    it('should set changeOrganisationHref correctly', () => {
      const context = getContext({
        mainOrgOdsCode: '48G',
      });

      expect(context.changeOrganisationHref).toEqual(`${baseUrl}/organisation/48G/select`);
    });
  });
});

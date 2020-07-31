import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { getContext } from './contextCreator';

const mockOrdersData = [
  {
    orderId: 'order1',
    description: 'Some Order',
    lastUpdatedBy: 'Bob Smith',
    lastUpdated: '2020-05-06T09:29:52.4965647Z',
    dateCreated: '2020-05-06T09:29:52.4965653Z',
    status: 'Incomplete',
  },
  {
    orderId: 'order2',
    description: 'Some new order',
    lastUpdatedBy: 'Alice Smith',
    lastUpdated: '2020-06-06T09:29:52.49657Z',
    dateCreated: '2020-06-06T09:29:52.4965701Z',
    status: 'Complete',
  },
];

describe('getContext', () => {
  it('should return the contents of the manifest', () => {
    const context = getContext({});
    expect(context.backLinkText).toEqual(manifest.backLinkText);
    expect(context.description).toEqual(manifest.description);
    expect(context.newOrderButtonText).toEqual(manifest.newOrderButtonText);
    expect(context.incompleteOrdersTableTitle).toEqual(manifest.incompleteOrdersTableTitle);
    expect(context.completeOrdersTableTitle).toEqual(manifest.completeOrdersTableTitle);
    expect(context.columnInfo).toEqual(manifest.columnInfo);
    expect(context.columnClass).toEqual(manifest.columnClass);
  });

  it('should construct title', () => {
    const context = getContext({ orgName: 'Org1' });
    expect(context.title).toEqual('Org1 orders');
  });

  it('should construct newOrderButtonHref', () => {
    const context = getContext({});
    expect(context.newOrderButtonHref).toEqual(`${baseUrl}/organisation/neworder`);
  });

  describe('ordersData', () => {
    it('should format a complete order correctly', () => {
      const context = getContext({ orgName: 'Org1', ordersData: mockOrdersData });
      expect(context.completeOrders.length).toEqual(1);
      const completeOrder1 = context.completeOrders[0];
      expect(completeOrder1[0].data).toEqual('order2');
      expect(completeOrder1[0].href).toEqual(`${baseUrl}/organisation/order2`);
      expect(completeOrder1[0].dataTestId).toEqual('order2-id');
      expect(completeOrder1[1].data).toEqual('Some new order');
      expect(completeOrder1[1].dataTestId).toEqual('order2-description');
      expect(completeOrder1[2].data).toEqual('Alice Smith');
      expect(completeOrder1[2].dataTestId).toEqual('order2-lastUpdatedBy');
      expect(completeOrder1[3].data).toEqual('6 June 2020');
      expect(completeOrder1[3].dataTestId).toEqual('order2-lastUpdated');
      expect(completeOrder1[4].data).toEqual('6 June 2020');
      expect(completeOrder1[4].dataTestId).toEqual('order2-dateCreated');
    });

    it('should format an incomplete order correctly', () => {
      const context = getContext({ orgName: 'Org1', ordersData: mockOrdersData });
      expect(context.incompleteOrders.length).toEqual(1);
      const incompleteOrder1 = context.incompleteOrders[0];
      expect(incompleteOrder1[0].data).toEqual('order1');
      expect(incompleteOrder1[0].href).toEqual(`${baseUrl}/organisation/order1`);
      expect(incompleteOrder1[0].dataTestId).toEqual('order1-id');
      expect(incompleteOrder1[1].data).toEqual('Some Order');
      expect(incompleteOrder1[1].dataTestId).toEqual('order1-description');
      expect(incompleteOrder1[2].data).toEqual('Bob Smith');
      expect(incompleteOrder1[2].dataTestId).toEqual('order1-lastUpdatedBy');
      expect(incompleteOrder1[3].data).toEqual('6 May 2020');
      expect(incompleteOrder1[3].dataTestId).toEqual('order1-lastUpdated');
      expect(incompleteOrder1[4].data).toEqual('6 May 2020');
      expect(incompleteOrder1[4].dataTestId).toEqual('order1-dateCreated');
    });

    it('should sort orders on complete/incomplete', () => {
      const manyMockOrders = [
        { status: 'Incomplete' },
        { status: 'Incomplete' },
        { status: 'Complete' },
        { status: 'Incomplete' },
        { status: 'Complete' },
        { status: 'Incomplete' },
        { status: 'Incomplete' },
      ];
      const context = getContext({ orgName: 'Org1', ordersData: manyMockOrders });
      expect(context.incompleteOrders.length).toEqual(5);
      expect(context.completeOrders.length).toEqual(2);
    });
  });
});

import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { baseUrl, orderApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/associated-services';

const mockAddedOrderItems = [
  {
    catalogueItemId: 'orderItem1',
    catalogueItemName: 'Associated Service One',
    itemUnit: {
      name: 'patient',
      description: 'per patient',
    },
    timeUnit: {
      name: 'month',
      description: 'per month',
    },
  },
  {
    catalogueItemId: 'orderItem2',
    catalogueItemName: 'Associated Service Two',
    itemUnit: {
      name: 'appointment',
      description: 'per appointment',
    },
  },
];

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/order-items?catalogueItemType=AssociatedService')
    .reply(200, mockAddedOrderItems);
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/sections/description')
    .reply(200, { description: 'Some order' });
};

const pageSetup = async (setup = { withAuth: true, getRoute: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
};

fixture('Associated-services - Dashboard page - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the added associated service table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const addedOrderItemsColumnHeading1 = addedOrderItems.find('[data-test-id="column-heading-0"]');
  const addedOrderItemsColumnHeading2 = addedOrderItems.find('[data-test-id="column-heading-1"]');

  await t
    .expect(await extractInnerText(addedOrderItemsColumnHeading1)).eql('Associated Service')
    .expect(await extractInnerText(addedOrderItemsColumnHeading2)).eql('Unit of order');
});

test('should render the added associated service items in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const row1 = addedOrderItems.find('[data-test-id="table-row-0"]');
  const row1CatalogueItemName = row1.find('a[data-test-id="orderItem1-catalogueItemName"]');
  const row2 = addedOrderItems.find('[data-test-id="table-row-1"]');
  const row2CatalogueItemName = row2.find('a[data-test-id="orderItem2-catalogueItemName"]');

  await t
    .expect(await extractInnerText(row1CatalogueItemName)).eql('Associated Service One')
    .expect(row1CatalogueItemName.getAttribute('href')).eql(`${baseUrl}/organisation/order-1/associated-services/orderItem1`)

    .expect(await extractInnerText(row2CatalogueItemName)).eql('Associated Service Two')
    .expect(row2CatalogueItemName.getAttribute('href')).eql(`${baseUrl}/organisation/order-1/associated-services/orderItem2`);
});

import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { baseUrl, orderApiUrl } from '../../../../../../config';
import { nockCheck } from '../../../../../../test-utils/nockChecker';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/associated-services';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockAddedOrderItems = [
  {
    orderItemId: 'orderItem1',
    catalogueItemName: 'Associated Service One',
  },
  {
    orderItemId: 'orderItem2',
    catalogueItemName: 'Associated Service Two',
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

const pageSetup = async () => {
  mocks();
  await setCookies();
};

fixture('Associated-services - Dashboard page - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockCheck(nock, t);
  });

test('should render the added associated service table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const addedOrderItemsColumnHeading1 = addedOrderItems.find('[data-test-id="column-heading-0"]');

  await t
    .expect(addedOrderItems.exists).ok()
    .expect(addedOrderItemsColumnHeading1.exists).ok()
    .expect(await extractInnerText(addedOrderItemsColumnHeading1))
    .eql('Associated Services for this order');
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
    .expect(row1.exists).ok()
    .expect(row1CatalogueItemName.exists).ok()
    .expect(await extractInnerText(row1CatalogueItemName))
    .eql('Associated Service One')
    .expect(row1CatalogueItemName.getAttribute('href'))
    .eql(`${baseUrl}/organisation/order-1/associated-services/orderItem1`)

    .expect(row2.exists)
    .ok()
    .expect(row2CatalogueItemName.exists)
    .ok()
    .expect(await extractInnerText(row2CatalogueItemName))
    .eql('Associated Service Two')
    .expect(row2CatalogueItemName.getAttribute('href'))
    .eql(`${baseUrl}/organisation/order-1/associated-services/orderItem2`);
});
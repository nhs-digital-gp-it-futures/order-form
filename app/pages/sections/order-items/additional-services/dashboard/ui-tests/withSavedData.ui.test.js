import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { baseUrl, orderApiUrl } from '../../../../../../config';
import { nockCheck, setState, authTokenInSession } from '../../../../../../test-utils/nockChecker';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/additional-services';

const mockAddedOrderItems = [
  {
    orderItemId: 'orderItem1',
    catalogueItemName: 'Additional Service One',
    serviceRecipient: {
      name: 'Recipient One',
      odsCode: 'recipient-1',
    },
  },
  {
    orderItemId: 'orderItem2',
    catalogueItemName: 'Additional Service Two',
    serviceRecipient: {
      name: 'Recipient Two',
      odsCode: 'recipient-2',
    },
  },
];

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/order-items?catalogueItemType=AdditionalService')
    .reply(200, mockAddedOrderItems);
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/sections/description')
    .reply(200, { description: 'Some order' });
};

const pageSetup = async () => {
  mocks();
  await setState(ClientFunction)('fakeToken', authTokenInSession);
};

fixture('Additional-services - Dashboard page - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockCheck(nock, t);
  });

test('should render the added additional service table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const addedOrderItemsColumnHeading1 = addedOrderItems.find('[data-test-id="column-heading-0"]');
  const addedOrderItemsColumnHeading2 = addedOrderItems.find('[data-test-id="column-heading-1"]');

  await t
    .expect(await extractInnerText(addedOrderItemsColumnHeading1))
    .eql('Additional Service')

    .expect(await extractInnerText(addedOrderItemsColumnHeading2))
    .eql('Service Recipient (ODS code)');
});

test('should render the added additional service items in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const row1 = addedOrderItems.find('[data-test-id="table-row-0"]');
  const row1CatalogueItemName = row1.find('a[data-test-id="orderItem1-catalogueItemName"]');
  const row1ServiceRecipient = row1.find('div[data-test-id="orderItem1-serviceRecipient"]');
  const row2 = addedOrderItems.find('[data-test-id="table-row-1"]');
  const row2CatalogueItemName = row2.find('a[data-test-id="orderItem2-catalogueItemName"]');
  const row2ServiceRecipient = row2.find('div[data-test-id="orderItem2-serviceRecipient"]');

  await t
    .expect(await extractInnerText(row1CatalogueItemName)).eql('Additional Service One')
    .expect(row1CatalogueItemName.getAttribute('href')).eql(`${baseUrl}/organisation/order-1/additional-services/orderItem1`)
    .expect(await extractInnerText(row1ServiceRecipient)).eql('Recipient One (recipient-1)')

    .expect(await extractInnerText(row2CatalogueItemName)).eql('Additional Service Two')
    .expect(row2CatalogueItemName.getAttribute('href')).eql(`${baseUrl}/organisation/order-1/additional-services/orderItem2`)
    .expect(await extractInnerText(row2ServiceRecipient)).eql('Recipient Two (recipient-2)');
});

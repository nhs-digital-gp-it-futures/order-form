import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { baseUrl, orderApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/catalogue-solutions';

const mockAddedOrderItems = [
  {
    orderItemId: 'orderItem1',
    catalogueItemName: 'Solution One',
    serviceRecipient: {
      name: 'Recipient One',
      odsCode: 'recipient-1',
    },
  },
  {
    orderItemId: 'orderItem2',
    catalogueItemName: 'Solution One',
    serviceRecipient: {
      name: 'Recipient Two',
      odsCode: 'recipient-2',
    },
  },
];

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/order-items?catalogueItemType=Solution')
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

fixture('Catalogue-solutions - Dashboard page - without saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the added catalogue solutions table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const addedOrderItemsColumnHeading1 = addedOrderItems.find('[data-test-id="column-heading-0"]');
  const addedOrderItemsColumnHeading2 = addedOrderItems.find('[data-test-id="column-heading-1"]');

  await t
    .expect(await extractInnerText(addedOrderItemsColumnHeading1)).eql('Catalogue Solution')
    .expect(await extractInnerText(addedOrderItemsColumnHeading2)).eql('Service Recipient (ODS code)');
});

test('should render the added catalogue solutions items in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const row1 = addedOrderItems.find('[data-test-id="table-row-0"]');
  const row1SolutionName = row1.find('a[data-test-id="orderItem1-catalogueItemName"]');
  const row1ServiceRecipient = row1.find('div[data-test-id="orderItem1-serviceRecipient"]');
  const row2 = addedOrderItems.find('[data-test-id="table-row-1"]');
  const row2SolutionName = row2.find('a[data-test-id="orderItem2-catalogueItemName"]');
  const row2ServiceRecipient = row2.find('div[data-test-id="orderItem2-serviceRecipient"]');

  await t
    .expect(await extractInnerText(row1SolutionName)).eql('Solution One')
    .expect(row1SolutionName.getAttribute('href')).eql(`${baseUrl}/organisation/order-1/catalogue-solutions/orderItem1`)
    .expect(await extractInnerText(row1ServiceRecipient)).eql('Recipient One (recipient-1)')

    .expect(await extractInnerText(row2SolutionName)).eql('Solution One')
    .expect(row2SolutionName.getAttribute('href')).eql(`${baseUrl}/organisation/order-1/catalogue-solutions/orderItem2`)
    .expect(await extractInnerText(row2ServiceRecipient)).eql('Recipient Two (recipient-2)');
});

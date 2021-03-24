import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { baseUrl, orderApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';

const organisation = 'organisation';
const callOffId = 'C010000-01';

const pageUrl = `http://localhost:1234/order/${organisation}/${callOffId}/additional-services`;

const recipient1 = { name: 'Recipient One', odsCode: 'recipient-1' };
const recipient2 = { name: 'Recipient Two', odsCode: 'recipient-2' };

const orderItem1 = {
  catalogueItemId: '10001-001',
  catalogueItemName: 'Additional Service One',
  serviceRecipients: [recipient1],
};

const orderItem2 = {
  catalogueItemId: '10001-002',
  catalogueItemName: 'Additional Service Two',
  serviceRecipients: [recipient2],
};

const mockAddedOrderItems = [orderItem1, orderItem2];

const mocks = () => {
  nock(orderApiUrl)
    .get(`/api/v1/orders/${callOffId}/order-items?catalogueItemType=AdditionalService`)
    .reply(200, mockAddedOrderItems);
  nock(orderApiUrl)
    .get(`/api/v1/orders/${callOffId}/sections/description`)
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

fixture('Additional-services - Dashboard page - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the added additional service table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const addedOrderItemsColumnHeading1 = addedOrderItems.find('[data-test-id="column-heading-0"]');
  const addedOrderItemsColumnHeading2 = addedOrderItems.find('[data-test-id="column-heading-1"]');

  await t
    .expect(await extractInnerText(addedOrderItemsColumnHeading1)).eql('Additional Service')
    .expect(await extractInnerText(addedOrderItemsColumnHeading2)).eql('Service Recipient (ODS code)');
});

test('should render the added additional service items in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const row1 = addedOrderItems.find('[data-test-id="table-row-0"]');
  const row1CatalogueItemName = row1.find(`a[data-test-id="${orderItem1.catalogueItemId}-catalogueItemName"]`);
  const row1ServiceRecipient = row1.find(`div[data-test-id="${orderItem1.catalogueItemId}-serviceRecipient"]`);
  const row2 = addedOrderItems.find('[data-test-id="table-row-1"]');
  const row2CatalogueItemName = row2.find(`a[data-test-id="${orderItem2.catalogueItemId}-catalogueItemName"]`);
  const row2ServiceRecipient = row2.find(`div[data-test-id="${orderItem2.catalogueItemId}-serviceRecipient"]`);

  await t
    .expect(await extractInnerText(row1CatalogueItemName)).eql(orderItem1.catalogueItemName)
    .expect(row1CatalogueItemName.getAttribute('href')).eql(`${baseUrl}/${organisation}/${callOffId}/additional-services/${orderItem1.catalogueItemId}`)
    .expect(await extractInnerText(row1ServiceRecipient)).eql(`${recipient1.name} (${recipient1.odsCode})`)

    .expect(await extractInnerText(row2CatalogueItemName)).eql(orderItem2.catalogueItemName)
    .expect(row2CatalogueItemName.getAttribute('href')).eql(`${baseUrl}/${organisation}/${callOffId}/additional-services/${orderItem2.catalogueItemId}`)
    .expect(await extractInnerText(row2ServiceRecipient)).eql(`${recipient2.name} (${recipient2.odsCode})`);
});

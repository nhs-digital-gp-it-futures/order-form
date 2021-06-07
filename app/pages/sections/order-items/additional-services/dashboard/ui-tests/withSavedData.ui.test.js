import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { baseUrl, orderApiUrl, organisationApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';
import mockOrgData from '../../../../../../test-utils/mockData/mockOrganisationData.json';

const organisation = 'organisation';
const callOffId = 'C010000-01';
const odsCode = 'odsCode';

const pageUrl = `http://localhost:1234/order/${organisation}/${odsCode}/order/${callOffId}/additional-services`;

const recipient1 = { name: 'Recipient One', odsCode: 'recipient-1' };
const recipient2 = { name: 'Recipient Two', odsCode: 'recipient-2' };

const orderItem1 = {
  provisioningType: 'Patient',
  catalogueItemId: '10001-001',
  catalogueItemName: 'Additional Service One',
  itemUnit: {
    name: 'patient',
    description: 'per patient',
  },
  timeUnit: {
    name: 'month',
    description: 'per month',
  },
  serviceRecipients: [recipient1, recipient2],
};

const orderItem2 = {
  catalogueItemId: '10001-002',
  catalogueItemName: 'Additional Service Two',
  provisioningType: 'OnDemand',
  serviceRecipients: [recipient2],
  itemUnit: {
    name: 'appointment',
    description: 'per appointment',
  },
};

const mockAddedOrderItems = [orderItem1, orderItem2];

const mocks = () => {
  nock(orderApiUrl)
    .get(`/api/v1/orders/${callOffId}/order-items?catalogueItemType=AdditionalService`)
    .reply(200, mockAddedOrderItems);
  nock(orderApiUrl)
    .get(`/api/v1/orders/${callOffId}/sections/description`)
    .reply(200, { description: 'Some order' });
  nock(organisationApiUrl)
    .get('/api/v1/ods/odsCode')
    .times(2)
    .reply(200, mockOrgData);
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
  const addedOrderItemsColumnHeading3 = addedOrderItems.find('[data-test-id="column-heading-2"]');

  await t
    .expect(await extractInnerText(addedOrderItemsColumnHeading1)).eql('Additional Service')
    .expect(await extractInnerText(addedOrderItemsColumnHeading2)).eql('Unit of order')
    .expect(await extractInnerText(addedOrderItemsColumnHeading3)).eql('Service Recipient (ODS code)');
});

test('should render the added additional service items in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const row1 = addedOrderItems.find('[data-test-id="table-row-0"]');
  const row1SolutionName = row1.find(`a[data-test-id="${orderItem1.catalogueItemId}-catalogueItemName"]`);
  const row1UnitOfOrder = row1.find(`div[data-test-id="${orderItem1.catalogueItemId}-unitoforder"]`);
  const row1ServiceRecipients = row1.find(`div[data-test-id="${orderItem1.catalogueItemId}-serviceRecipients"]`);
  const row2 = addedOrderItems.find('[data-test-id="table-row-1"]');
  const row2SolutionName = row2.find(`a[data-test-id="${orderItem2.catalogueItemId}-catalogueItemName"]`);
  const row2UnitOfOrder = row2.find(`div[data-test-id="${orderItem2.catalogueItemId}-unitoforder"]`);
  const row2ServiceRecipients = row2.find(`div[data-test-id="${orderItem2.catalogueItemId}-serviceRecipients"]`);

  await t
    .expect(await extractInnerText(row1SolutionName)).eql(orderItem1.catalogueItemName)
    .expect(row1SolutionName.getAttribute('href')).eql(`${baseUrl}/${organisation}/${odsCode}/order/${callOffId}/additional-services/${orderItem1.catalogueItemId}`)
    .expect(await extractInnerText(row1UnitOfOrder)).eql(`${orderItem1.itemUnit.description} ${orderItem1.timeUnit.description}`)
    .expect(await extractInnerText(row1ServiceRecipients)).eql('Service recipients (ODS code)')
    .expect(row1ServiceRecipients.find('details[open]').exists).notOk()
    .click(row1ServiceRecipients.find('summary'))
    .expect(row1ServiceRecipients.find('details[open]').exists).ok()
    .expect(await extractInnerText(row1ServiceRecipients.find('.nhsuk-details__text')))
    .eql(`${recipient1.name} (${recipient1.odsCode})${recipient2.name} (${recipient2.odsCode})`)

    .expect(await extractInnerText(row2SolutionName)).eql(orderItem2.catalogueItemName)
    .expect(row2SolutionName.getAttribute('href')).eql(`${baseUrl}/${organisation}/${odsCode}/order/${callOffId}/additional-services/${orderItem2.catalogueItemId}`)
    .expect(await extractInnerText(row2UnitOfOrder)).eql(`${orderItem2.itemUnit.description}`)
    .expect(await extractInnerText(row2ServiceRecipients)).eql('Service recipients (ODS code)')
    .expect(row2ServiceRecipients.find('details[open]').exists).notOk()
    .click(row2ServiceRecipients.find('summary'))
    .expect(row2ServiceRecipients.find('details[open]').exists).ok()
    .expect(await extractInnerText(row2ServiceRecipients.find('.nhsuk-details__text')))
    .eql('Recipient Two (recipient-2)');
});

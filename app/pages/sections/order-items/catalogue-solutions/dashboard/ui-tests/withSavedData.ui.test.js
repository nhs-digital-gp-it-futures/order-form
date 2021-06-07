import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { baseUrl, orderApiUrl, organisationApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';
import mockOrgData from '../../../../../../test-utils/mockData/mockOrganisationData.json';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-1/catalogue-solutions';

const mockAddedOrderItems = [
  {
    catalogueItemName: 'Solution One',
    catalogueItemId: 'orderItem1',
    serviceRecipients: [{
      name: 'Recipient One',
      odsCode: 'recipient-1',
    },
    {
      name: 'Recipient Three',
      odsCode: 'recipient-3',
    }],
    itemUnit: {
      name: 'patient',
      description: 'per patient',
    },
    timeUnit: {
      name: 'year',
      description: 'per year',
    },
  },
  {
    catalogueItemName: 'Solution Two',
    catalogueItemId: 'orderItem2',
    serviceRecipients: [{
      name: 'Recipient Two',
      odsCode: 'recipient-2',
    }],
    itemUnit: {
      name: 'patient',
      description: 'per patient',
    },
    timeUnit: {
      name: 'year',
      description: 'per year',
    },
  },
  {
    catalogueItemName: 'Solution Two',
    catalogueItemId: 'orderItem3',
    serviceRecipients: [{
      name: 'Recipient Three',
      odsCode: 'recipient-3',
    }],
    itemUnit: {
      name: 'patient',
      description: 'per patient',
    },
    timeUnit: {
      name: 'year',
      description: 'per year',
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
  nock(organisationApiUrl)
    .get('/api/v1/ods/odsCode')
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
  const addedOrderItemsColumnHeading3 = addedOrderItems.find('[data-test-id="column-heading-2"]');

  await t
    .expect(await extractInnerText(addedOrderItemsColumnHeading1)).eql('Catalogue Solution')
    .expect(await extractInnerText(addedOrderItemsColumnHeading2)).eql('Unit of order')
    .expect(await extractInnerText(addedOrderItemsColumnHeading3)).eql('Service Recipients (ODS code)');
});

test('should render the added catalogue solutions items in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedOrderItems = Selector('[data-test-id="added-orderItems"]');
  const row1 = addedOrderItems.find('[data-test-id="table-row-0"]');
  const row1SolutionName = row1.find('a[data-test-id="orderItem1-catalogueItemName"]');
  const row1UnitOfOrder = row1.find('div[data-test-id="orderItem1-unitOfOrder"]');
  const row1ServiceRecipients = row1.find('div[data-test-id="orderItem1-serviceRecipients"]');
  const row2 = addedOrderItems.find('[data-test-id="table-row-1"]');
  const row2SolutionName = row2.find('a[data-test-id="orderItem2-catalogueItemName"]');
  const row2UnitOfOrder = row2.find('div[data-test-id="orderItem2-unitOfOrder"]');
  const row2ServiceRecipients = row2.find('div[data-test-id="orderItem2-serviceRecipients"]');

  await t
    .expect(await extractInnerText(row1SolutionName)).eql('Solution One')
    .expect(row1SolutionName.getAttribute('href')).eql(`${baseUrl}/organisation/odsCode/order/order-1/catalogue-solutions/orderItem1`)
    .expect(await extractInnerText(row1UnitOfOrder)).eql('per patient per year')
    .expect(await extractInnerText(row1ServiceRecipients)).eql('Service recipients (ODS code)')
    .expect(row1ServiceRecipients.find('details[open]').exists).notOk()
    .click(row1ServiceRecipients.find('summary'))
    .expect(row1ServiceRecipients.find('details[open]').exists).ok()
    .expect(await extractInnerText(row1ServiceRecipients.find('.nhsuk-details__text')))
    .eql('Recipient One (recipient-1)Recipient Three (recipient-3)')

    .expect(await extractInnerText(row2SolutionName)).eql('Solution Two')
    .expect(row2SolutionName.getAttribute('href')).eql(`${baseUrl}/organisation/odsCode/order/order-1/catalogue-solutions/orderItem2`)
    .expect(await extractInnerText(row2UnitOfOrder)).eql('per patient per year')
    .expect(await extractInnerText(row2ServiceRecipients)).eql('Service recipients (ODS code)')
    .expect(row2ServiceRecipients.find('details[open]').exists).notOk()
    .click(row2ServiceRecipients.find('summary'))
    .expect(row2ServiceRecipients.find('details[open]').exists).ok()
    .expect(await extractInnerText(row2ServiceRecipients.find('.nhsuk-details__text')))
    .eql('Recipient Two (recipient-2)');
});

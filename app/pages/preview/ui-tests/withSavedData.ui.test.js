import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/preview';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockOrder = {
  description: 'some order description',
  orderParty: {
    name: 'Call off org Name',
    odsCode: 'A01',
    address: {
      line1: 'Calloff First Line',
      line2: 'Calloff Second Line',
      town: 'Calloff Town',
      postcode: 'CO12 1AA',
    },
    primaryContact: {
      firstName: 'CallOffFirstName',
      lastName: 'CallOffLastName',
    },
  },
  supplier: {
    name: 'Supplier Name',
    address: {
      line1: 'Supplier First Line',
      line2: 'Supplier Second Line',
      town: 'Supplier Town',
      postcode: 'SU12 1AA',
    },
    primaryContact: {
      firstName: 'SuppFirstName',
      lastName: 'SuppLastName',
    },
  },
  commencementDate: '2020-02-01T00:00:00',
  orderItems: [
    {
      itemId: 'C000001-01-A10001-1',
      serviceRecipientsOdsCode: 'A10001',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'Solution',
      catalogueItemName: 'Some catalogue name',
      provisioningType: 'Patient',
      price: 1.260,
      itemUnitDescription: 'per patient',
      timeUnitDescription: 'per year',
      quantity: 3415,
      quantityPeriodDescription: 'per month',
      deliveryDate: '2020-07-06',
      costPerYear: 4302.900,
    },
  ],
  serviceRecipients: [
    {
      name: 'Blue Mountain Medical Practice',
      odsCode: 'A10001',
    },
  ],
};

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1')
    .reply(200, mockOrder);
};

const pageSetup = async (withAuth = true) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

fixture('Order Summary Preview - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should render the Call-off ordering party and supplier details in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const calloffAndSupplierTable = Selector('[data-test-id="calloff-and-supplier"]');
  const calloffAndSupplierDetails = calloffAndSupplierTable.find('[data-test-id="table-row-0"]');
  const calloffPartyDetails = calloffAndSupplierDetails.find('div[data-test-id="call-off-party"]');
  const supplierDetails = calloffAndSupplierDetails.find('div[data-test-id="supplier"]');

  await t
    .expect(calloffAndSupplierDetails.exists).ok()

    .expect(calloffPartyDetails.exists).ok()
    .expect(calloffPartyDetails.find('div').count).eql(8)
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(0))).eql('CallOffFirstName CallOffLastName')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(1))).eql('Call off org Name')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(2))).eql('A01')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(3))).eql('')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(4))).eql('Calloff First Line')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(5))).eql('Calloff Second Line')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(6))).eql('Calloff Town')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(7))).eql('CO12 1AA')

    .expect(supplierDetails.exists).ok()
    .expect(supplierDetails.find('div').count).eql(7)
    .expect(await extractInnerText(supplierDetails.find('div').nth(0))).eql('SuppFirstName SuppLastName')
    .expect(await extractInnerText(supplierDetails.find('div').nth(1))).eql('Supplier Name')
    .expect(await extractInnerText(supplierDetails.find('div').nth(2))).eql('')
    .expect(await extractInnerText(supplierDetails.find('div').nth(3))).eql('Supplier First Line')
    .expect(await extractInnerText(supplierDetails.find('div').nth(4))).eql('Supplier Second Line')
    .expect(await extractInnerText(supplierDetails.find('div').nth(5))).eql('Supplier Town')
    .expect(await extractInnerText(supplierDetails.find('div').nth(6))).eql('SU12 1AA');
});

test('should render the commencement date label and date when data is provided', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const commencementDate = Selector('[data-test-id="commencement-date"]');

  await t
    .expect(commencementDate.exists).ok()
    .expect(await extractInnerText(commencementDate)).eql(`${content.commencementDateLabel} 1 February 2020`);
});

test('should render the recurring cost item details in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const recurringCostTable = Selector('[data-test-id="recurring-cost-table"]');
  const recurringCost = recurringCostTable.find('[data-test-id="table-row-0"]');

  await t
    .debug()
    .expect(recurringCost.exists).ok()

    .expect(await extractInnerText(recurringCost.find('div').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(recurringCost.find('div').nth(1))).eql('C000001-01-A10001-1')
    .expect(await extractInnerText(recurringCost.find('div').nth(2))).eql('Some catalogue name')
    .expect(await extractInnerText(recurringCost.find('div').nth(3))).eql('£1.26 per patient per year')
    .expect(await extractInnerText(recurringCost.find('div').nth(4))).eql('3,415 per month')
    .expect(await extractInnerText(recurringCost.find('div').nth(5))).eql('6 July 2020')
    .expect(await extractInnerText(recurringCost.find('div').nth(6))).eql('4,302.90');
});

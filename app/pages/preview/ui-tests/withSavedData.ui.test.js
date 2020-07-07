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
    {
      itemId: 'C000001-01-A10001-2',
      serviceRecipientsOdsCode: 'A10001',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'Solution',
      catalogueItemName: 'Some catalogue name',
      provisioningType: 'OnDemand',
      price: 500.261,
      itemUnitDescription: 'per license',
      quantity: 12,
      deliveryDate: '2020-08-06',
      costPerYear: 6003.132,
    },
  ],
  serviceRecipients: [
    {
      name: 'Blue Mountain Medical Practice',
      odsCode: 'A10001',
    },
  ],
  totalOneOffCost: 101.111,
  totalRecurringCostPerYear: 1981.028,
  totalRecurringCostPerMonth: 191.691,
  totalOwnershipCost: 2345.430,
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

test('should render the one off cost totals table with one off cost total price', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const oneOffCostTotalsTable = Selector('[data-test-id="one-off-cost-totals-table"]');
  const row1 = oneOffCostTotalsTable.find('[data-test-id="table-row-0"]');
  const totalCostLabelCell = row1.find('div[data-test-id="total-cost-label"]');
  const totalCostValueCell = row1.find('div[data-test-id="total-cost-value"]');

  await t
    .expect(oneOffCostTotalsTable.exists).ok()

    .expect(totalCostLabelCell.exists).ok()
    .expect(await extractInnerText(totalCostLabelCell)).eql(content.oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.data)

    .expect(totalCostValueCell.exists).ok()
    .expect(await extractInnerText(totalCostValueCell)).eql('101.11');
});

test.only('should render the recurring cost item details in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const recurringCostTable = Selector('[data-test-id="recurring-cost-table"]');
  const recurringCostRow0 = recurringCostTable.find('[data-test-id="table-row-0"]');
  const recurringCostRow1 = recurringCostTable.find('[data-test-id="table-row-1"]');
  await t
    .expect(recurringCostRow0.exists).ok()
    .expect(recurringCostRow1.exists).ok()

    .expect(await extractInnerText(recurringCostRow0.find('div').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(recurringCostRow0.find('div').nth(1))).eql('C000001-01-A10001-1')
    .expect(await extractInnerText(recurringCostRow0.find('div').nth(2))).eql('Some catalogue name')
    .expect(await extractInnerText(recurringCostRow0.find('div').nth(3))).eql('1.26 per patient per year')
    .expect(await extractInnerText(recurringCostRow0.find('div').nth(4))).eql('3,415 per month')
    .expect(await extractInnerText(recurringCostRow0.find('div').nth(5))).eql('6 July 2020')
    .expect(await extractInnerText(recurringCostRow0.find('div').nth(6))).eql('4,302.90')

    .expect(await extractInnerText(recurringCostRow1.find('div').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(recurringCostRow1.find('div').nth(1))).eql('C000001-01-A10001-2')
    .expect(await extractInnerText(recurringCostRow1.find('div').nth(2))).eql('Some catalogue name')
    .expect(await extractInnerText(recurringCostRow1.find('div').nth(3))).eql('500.26 per license')
    .expect(await extractInnerText(recurringCostRow1.find('div').nth(4))).eql('12')
    .expect(await extractInnerText(recurringCostRow1.find('div').nth(5))).eql('6 August 2020')
    .expect(await extractInnerText(recurringCostRow1.find('div').nth(6))).eql('6,003.13');
});

test('should render the recurring cost totals table with the totals provided', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const recurringCostTotalsTable = Selector('[data-test-id="recurring-cost-totals-table"]');

  const row1 = recurringCostTotalsTable.find('[data-test-id="table-row-0"]');
  const totalYearCostLabelCell = row1.find('div[data-test-id="total-year-cost-label"]');
  const totalYearCostValueCell = row1.find('div[data-test-id="total-year-cost-value"]');

  const row2 = recurringCostTotalsTable.find('[data-test-id="table-row-1"]');
  const totalMonthlyCostLabelCell = row2.find('div[data-test-id="total-monthly-cost-label"]');
  const totalMonthlyCostValueCell = row2.find('div[data-test-id="total-monthly-cost-value"]');

  const row3 = recurringCostTotalsTable.find('[data-test-id="table-row-2"]');
  const totalOwnershipCostLabelCell = row3.find('div[data-test-id="total-ownership-cost-label"]');
  const totalOwnershipCostValueCell = row3.find('div[data-test-id="total-ownership-cost-value"]');

  const row4 = recurringCostTotalsTable.find('[data-test-id="table-row-3"]');
  const totalOwnershipTermsLabelCell = row4.find('div[data-test-id="total-ownership-terms"]');

  await t
    .expect(recurringCostTotalsTable.exists).ok()

    .expect(totalYearCostLabelCell.exists).ok()
    .expect(await extractInnerText(totalYearCostLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalOneYearCostLabel.data)
    .expect(totalYearCostValueCell.exists).ok()
    .expect(await extractInnerText(totalYearCostValueCell)).eql('1,981.02')

    .expect(totalMonthlyCostLabelCell.exists).ok()
    .expect(await extractInnerText(totalMonthlyCostLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.data)
    .expect(totalMonthlyCostValueCell.exists).ok()
    .expect(await extractInnerText(totalMonthlyCostValueCell)).eql('191.69')

    .expect(totalOwnershipCostLabelCell.exists).ok()
    .expect(await extractInnerText(totalOwnershipCostLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.data)
    .expect(totalOwnershipCostValueCell.exists).ok()
    .expect(await extractInnerText(totalOwnershipCostValueCell)).eql('2,345.43')

    .expect(totalOwnershipTermsLabelCell.exists).ok()
    .expect(await extractInnerText(totalOwnershipTermsLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalOwnershipTerms.data);
});

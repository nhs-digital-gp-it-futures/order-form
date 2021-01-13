import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/summary';

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
      itemId: 'C000001-01-A10003-1',
      serviceRecipientsOdsCode: 'A10003',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'Solution',
      catalogueItemName: 'Some catalogue name',
      serviceInstanceId: 'SI1-A10003',
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
      serviceInstanceId: 'SI1-A10001',
      provisioningType: 'OnDemand',
      price: 500.261,
      itemUnitDescription: 'per license',
      quantity: 12,
      deliveryDate: '2020-08-06',
      costPerYear: 6003.132,
    },
    {
      itemId: 'C000001-01-A10002-3',
      serviceRecipientsOdsCode: 'A10002',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'Solution',
      catalogueItemName: 'Remote Consultation',
      serviceInstanceId: 'SI1-A10002',
      provisioningType: 'Declarative',
      price: 207.916,
      itemUnitDescription: 'per practice',
      timeUnitDescription: 'per month',
      quantityPeriodDescription: 'per year',
      quantity: 12,
      deliveryDate: '2020-09-25',
      costPerYear: 29939.90,
    },
    {
      itemId: 'C000001-01-A10001-4',
      serviceRecipientsOdsCode: 'A10001',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AdditionalService',
      catalogueItemName: 'Remote Consultation',
      serviceInstanceId: 'SI1-A10001',
      provisioningType: 'Declarative',
      price: 207.916,
      itemUnitDescription: 'per practice',
      timeUnitDescription: 'per month',
      quantityPeriodDescription: 'per year',
      quantity: 12,
      deliveryDate: '2020-09-25',
      costPerYear: 29939.90,
    },
    {
      itemId: 'C000001-01-A10003-5',
      serviceRecipientsOdsCode: 'A10003',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AdditionalService',
      catalogueItemName: 'Patient Consultation',
      serviceInstanceId: 'SI1-A10003',
      provisioningType: 'Patient',
      price: 106.025,
      itemUnitDescription: 'per patient',
      timeUnitDescription: 'per month',
      quantityPeriodDescription: 'per year',
      quantity: 12,
      deliveryDate: '2020-09-25',
      costPerYear: 15267.60,
    },
    {
      itemId: 'C000001-01-A10002-6',
      serviceRecipientsOdsCode: 'A10002',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AdditionalService',
      catalogueItemName: 'OnDemand Consultation',
      serviceInstanceId: 'SI1-A10002',
      provisioningType: 'OnDemand',
      price: 1.33,
      itemUnitDescription: 'per consultation',
      quantity: 4,
      quantityPeriodDescription: 'per year',
      deliveryDate: '2020-09-25',
      costPerYear: 63.84,
    },
    {
      itemId: 'C000001-01-A10001-23',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AssociatedService',
      catalogueItemName: 'Core Training',
      serviceInstanceId: 'SI1-A10001',
      catalogueItemId: '10000-S-001',
      provisioningType: 'Declarative',
      price: 585.00,
      itemUnitDescription: 'per Day',
      quantity: 70,
      costPerYear: 40850.00,
      serviceRecipientsOdsCode: 'A10001',
    },
    {
      itemId: 'C000001-01-A10002-24',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AssociatedService',
      catalogueItemName: 'OnDemand associated service',
      serviceInstanceId: 'SI1-A10002',
      catalogueItemId: '10000-S-002',
      provisioningType: 'OnDemand',
      price: 0.7,
      itemUnitDescription: 'per fragment',
      quantity: 600,
      quantityPeriodDescription: 'per month',
      costPerYear: 5040.00,
      serviceRecipientsOdsCode: 'A10002',
    },
    {
      itemId: 'C000001-01-A10001-33',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AssociatedService',
      catalogueItemName: 'All Training',
      serviceInstanceId: 'SI1-A10001',
      catalogueItemId: '10000-S-003',
      provisioningType: 'Declarative',
      price: 50.00,
      itemUnitDescription: 'per Day',
      quantity: 10,
      costPerYear: 501.00,
      serviceRecipientsOdsCode: 'A10001',
    },
    {
      itemId: 'C000001-01-A10001-34',
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AssociatedService',
      catalogueItemName: '55 Training',
      serviceInstanceId: 'SI1-A10001',
      catalogueItemId: '10000-S-003',
      provisioningType: 'Declarative',
      price: 55.55,
      itemUnitDescription: 'per Day',
      quantity: 55,
      costPerYear: 5555.55,
      serviceRecipientsOdsCode: 'A10001',
    },
  ],
  serviceRecipients: [
    {
      name: 'Red Mountain Medical Practice',
      odsCode: 'A10002',
    },
    {
      name: 'Blue Mountain Medical Practice',
      odsCode: 'A10001',
    },
    {
      name: 'Yellow Mountain Medical Practice',
      odsCode: 'A10003',
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

const pageSetup = async (setup = { withAuth: true, getRoute: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
};

fixture('Order Summary for incomplete order - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the Call-off ordering party and supplier details in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const calloffAndSupplierTable = Selector('[data-test-id="calloff-and-supplier"]');
  const calloffAndSupplierDetails = calloffAndSupplierTable.find('[data-test-id="table-row-0"]');
  const calloffPartyDetails = calloffAndSupplierDetails.find('div[data-test-id="call-off-party"]');
  const supplierDetails = calloffAndSupplierDetails.find('div[data-test-id="supplier"]');

  await t
    .expect(calloffPartyDetails.find('div').count).eql(8)
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(0))).eql('CallOffFirstName CallOffLastName')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(1))).eql('Call off org Name')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(2))).eql('A01')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(3))).eql('')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(4))).eql('Calloff First Line')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(5))).eql('Calloff Second Line')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(6))).eql('Calloff Town')
    .expect(await extractInnerText(calloffPartyDetails.find('div').nth(7))).eql('CO12 1AA')

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
    .expect(await extractInnerText(commencementDate)).eql(`${content.commencementDateLabel} 1 February 2020`);
});

test('should render the oneOff cost item details in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const oneOffCostTable = Selector('[data-test-id="one-off-cost-table"]');
  const oneOffCostRow0 = oneOffCostTable.find('[data-test-id="table-row-0"]');
  const oneOffCostRow1 = oneOffCostTable.find('[data-test-id="table-row-1"]');
  const oneOffCostRow2 = oneOffCostTable.find('[data-test-id="table-row-2"]');

  await t
    .expect(await extractInnerText(oneOffCostRow0.find('td').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(oneOffCostRow0.find('td').nth(1))).eql('C000001-01-A10001-34')
    .expect(await extractInnerText(oneOffCostRow0.find('td').nth(2))).eql('55 Training')
    .expect(await extractInnerText(oneOffCostRow0.find('td').nth(3))).eql('55.55 per Day')
    .expect(await extractInnerText(oneOffCostRow0.find('td').nth(4))).eql('55')
    .expect(await extractInnerText(oneOffCostRow0.find('td').nth(5))).eql('5,555.55')

    .expect(await extractInnerText(oneOffCostRow1.find('td').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(oneOffCostRow1.find('td').nth(1))).eql('C000001-01-A10001-33')
    .expect(await extractInnerText(oneOffCostRow1.find('td').nth(2))).eql('All Training')
    .expect(await extractInnerText(oneOffCostRow1.find('td').nth(3))).eql('50.00 per Day')
    .expect(await extractInnerText(oneOffCostRow1.find('td').nth(4))).eql('10')
    .expect(await extractInnerText(oneOffCostRow1.find('td').nth(5))).eql('501.00')

    .expect(await extractInnerText(oneOffCostRow2.find('td').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(oneOffCostRow2.find('td').nth(1))).eql('C000001-01-A10001-23')
    .expect(await extractInnerText(oneOffCostRow2.find('td').nth(2))).eql('Core Training')
    .expect(await extractInnerText(oneOffCostRow2.find('td').nth(3))).eql('585.00 per Day')
    .expect(await extractInnerText(oneOffCostRow2.find('td').nth(4))).eql('70')
    .expect(await extractInnerText(oneOffCostRow2.find('td').nth(5))).eql('40,850.00');
});

test('should render the one off cost totals table with one off cost total price', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const oneOffCostTotalsTable = Selector('[data-test-id="one-off-cost-totals-table"]');
  const row1 = oneOffCostTotalsTable.find('[data-test-id="table-row-0"]');
  const totalCostLabelCell = row1.find('div[data-test-id="total-cost-label"]');
  const totalCostValueCell = row1.find('div[data-test-id="total-cost-value"]');

  await t
    .expect(await extractInnerText(totalCostLabelCell)).eql(content.oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.data)
    .expect(await extractInnerText(totalCostValueCell)).eql('101.11');
});

test('should render the recurring cost item details in the table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const recurringCostTable = Selector('[data-test-id="recurring-cost-table"]');
  const recurringCostRow0 = recurringCostTable.find('[data-test-id="table-row-0"]');
  const recurringCostRow1 = recurringCostTable.find('[data-test-id="table-row-1"]');
  const recurringCostRow2 = recurringCostTable.find('[data-test-id="table-row-2"]');
  const recurringCostRow3 = recurringCostTable.find('[data-test-id="table-row-3"]');
  const recurringCostRow4 = recurringCostTable.find('[data-test-id="table-row-4"]');
  const recurringCostRow5 = recurringCostTable.find('[data-test-id="table-row-5"]');
  const recurringCostRow6 = recurringCostTable.find('[data-test-id="table-row-6"]');

  await t
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(1))).eql('C000001-01-A10001-4')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(2))).eql('Remote Consultation')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(3))).eql('SI1-A10001')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(4))).eql('207.91 per practice per month')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(5))).eql('12 per year')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(6))).eql('25 September 2020')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(7))).eql('29,939.90')

    .expect(await extractInnerText(recurringCostRow1.find('td').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(1))).eql('C000001-01-A10001-2')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(2))).eql('Some catalogue name')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(3))).eql('SI1-A10001')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(4))).eql('500.26 per license')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(5))).eql('12')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(6))).eql('6 August 2020')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(7))).eql('6,003.13')

    .expect(await extractInnerText(recurringCostRow2.find('td').nth(0))).eql('Red Mountain Medical Practice (A10002)')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(1))).eql('C000001-01-A10002-24')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(2))).eql('OnDemand associated service')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(3))).eql('SI1-A10002')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(4))).eql('0.70 per fragment')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(5))).eql('600 per month')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(6))).eql('')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(7))).eql('5,040.00')

    .expect(await extractInnerText(recurringCostRow3.find('td').nth(0))).eql('Red Mountain Medical Practice (A10002)')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(1))).eql('C000001-01-A10002-6')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(2))).eql('OnDemand Consultation')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(3))).eql('SI1-A10002')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(4))).eql('1.33 per consultation')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(5))).eql('4 per year')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(6))).eql('25 September 2020')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(7))).eql('63.84')

    .expect(await extractInnerText(recurringCostRow4.find('td').nth(0))).eql('Red Mountain Medical Practice (A10002)')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(1))).eql('C000001-01-A10002-3')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(2))).eql('Remote Consultation')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(3))).eql('SI1-A10002')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(4))).eql('207.91 per practice per month')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(5))).eql('12 per year')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(6))).eql('25 September 2020')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(7))).eql('29,939.90')

    .expect(await extractInnerText(recurringCostRow5.find('td').nth(0))).eql('Yellow Mountain Medical Practice (A10003)')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(1))).eql('C000001-01-A10003-5')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(2))).eql('Patient Consultation')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(3))).eql('SI1-A10003')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(4))).eql('106.02 per patient per month')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(5))).eql('12 per year')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(6))).eql('25 September 2020')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(7))).eql('15,267.60')

    .expect(await extractInnerText(recurringCostRow6.find('td').nth(0))).eql('Yellow Mountain Medical Practice (A10003)')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(1))).eql('C000001-01-A10003-1')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(2))).eql('Some catalogue name')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(3))).eql('SI1-A10003')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(4))).eql('1.26 per patient per year')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(5))).eql('3,415 per month')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(6))).eql('6 July 2020')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(7))).eql('4,302.90');
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
    .expect(await extractInnerText(totalYearCostLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalOneYearCostLabel.data)
    .expect(await extractInnerText(totalYearCostValueCell)).eql('1,981.02')

    .expect(await extractInnerText(totalMonthlyCostLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.data)
    .expect(await extractInnerText(totalMonthlyCostValueCell)).eql('191.69')

    .expect(await extractInnerText(totalOwnershipCostLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.data)
    .expect(await extractInnerText(totalOwnershipCostValueCell)).eql('2,345.43')

    .expect(await extractInnerText(totalOwnershipTermsLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalOwnershipTerms.data);
});

import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl, organisationApiUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';
import mockOrgData from '../../../../test-utils/mockData/mockOrganisationData.json';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-1/summary';

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
      cataloguePriceType: 'Flat',
      catalogueItemType: 'Solution',
      catalogueItemName: 'Some catalogue name',
      serviceInstanceId: 'SI1-A10003',
      provisioningType: 'Patient',
      price: 1.260,
      itemUnitDescription: 'per patient',
      timeUnitDescription: 'per year',
      quantityPeriodDescription: 'per month',
      serviceRecipients: [
        {
          name: 'Yellow Mountain Medical Practice',
          odsCode: 'A10003',
          quantity: 3415,
          itemId: 'C000001-01-A10003-1',
          serviceInstanceId: 'SI1-B81046',
          deliveryDate: '2020-07-06',
          costPerYear: 4302.900,
        },
      ],
    },
    {
      cataloguePriceType: 'Flat',
      catalogueItemType: 'Solution',
      catalogueItemName: 'Some catalogue name',
      provisioningType: 'OnDemand',
      price: 500.261,
      itemUnitDescription: 'per licence',
      serviceRecipients: [
        {
          name: 'Blue Mountain Medical Practice',
          odsCode: 'A10001',
          itemId: 'C000001-01-A10001-2',
          serviceInstanceId: 'SI1-A10001',
          deliveryDate: '2020-08-06',
          quantity: 12,
          costPerYear: 6003.1321,
        },
      ],
    },
    {
      cataloguePriceType: 'Flat',
      catalogueItemType: 'Solution',
      catalogueItemName: 'Remote Consultation',
      provisioningType: 'Declarative',
      price: 207.916999,
      itemUnitDescription: 'per practice',
      timeUnitDescription: 'per month',
      quantityPeriodDescription: 'per year',
      serviceRecipients: [
        {
          itemId: 'C000001-01-A10002-3',
          name: 'Red Mountain Medical Practice',
          odsCode: 'A10002',
          quantity: 12,
          deliveryDate: '2020-09-25',
          serviceInstanceId: 'SI1-A10002',
          costPerYear: 29939.90,
        },
      ],
    },
    {
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AdditionalService',
      catalogueItemName: 'Remote Consultation',
      provisioningType: 'Declarative',
      price: 207.9161,
      itemUnitDescription: 'per practice',
      timeUnitDescription: 'per month',
      quantityPeriodDescription: 'per year',
      serviceRecipients: [
        {
          name: 'Blue Mountain Medical Practice',
          odsCode: 'A10001',
          itemId: 'C000001-01-A10001-4',
          quantity: 12,
          deliveryDate: '2020-09-25',
          serviceInstanceId: 'SI1-A10001',
          costPerYear: 29939.90,
        },
      ],
    },
    {
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AdditionalService',
      catalogueItemName: 'Patient Consultation',
      provisioningType: 'Patient',
      price: 106.025,
      itemUnitDescription: 'per patient',
      timeUnitDescription: 'per month',
      quantityPeriodDescription: 'per year',
      serviceRecipients: [
        {
          name: 'Yellow Mountain Medical Practice',
          odsCode: 'A10003',
          itemId: 'C000001-01-A10003-5',
          quantity: 12,
          deliveryDate: '2020-09-25',
          serviceInstanceId: 'SI1-A10003',
          costPerYear: 15267.60,
        },
      ],
    },
    {
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AdditionalService',
      catalogueItemName: 'OnDemand Consultation',
      provisioningType: 'OnDemand',
      price: 1.33,
      itemUnitDescription: 'per consultation',
      quantityPeriodDescription: 'per year',
      serviceRecipients: [
        {
          name: 'Red Mountain Medical Practice',
          odsCode: 'A10002',
          itemId: 'C000001-01-A10002-6',
          serviceInstanceId: 'SI1-A10002',
          quantity: 4,
          deliveryDate: '2020-09-25',
          costPerYear: 63.84,
        },
      ],
    },
    {
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AssociatedService',
      catalogueItemName: 'Core Training',
      catalogueItemId: '10000-S-001',
      provisioningType: 'Declarative',
      price: 585.00,
      itemUnitDescription: 'per Day',
      costPerYear: 40850.00,
      serviceRecipients: [
        {
          name: 'Blue Mountain Medical Practice',
          odsCode: 'A10001',
          itemId: 'C000001-01-A10001-23',
          serviceInstanceId: 'SI1-A10001',
          quantity: 70,
          deliveryDate: '2020-09-25',
        },
      ],
    },
    {
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AssociatedService',
      catalogueItemName: 'OnDemand associated service',
      catalogueItemId: '10000-S-002',
      provisioningType: 'OnDemand',
      price: 0.7,
      itemUnitDescription: 'per fragment',
      quantityPeriodDescription: 'per month',
      serviceRecipients: [
        {
          name: 'Red Mountain Medical Practice',
          odsCode: 'A10002',
          itemId: 'C000001-01-A10002-24',
          quantity: 600,
          serviceInstanceId: 'SI1-A10002',
          deliveryDate: '2020-09-25',
          costPerYear: 5040.00,
        },
      ],
    },
    {
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AssociatedService',
      catalogueItemName: 'All Training',
      catalogueItemId: '10000-S-003',
      provisioningType: 'Declarative',
      price: 50.00,
      itemUnitDescription: 'per Day',
      costPerYear: 501.00,
      serviceRecipients: [
        {
          name: 'Blue Mountain Medical Practice',
          odsCode: 'A10001',
          deliveryDate: '2020-09-25',
          itemId: 'C000001-01-A10001-33',
          quantity: 10,
          serviceInstanceId: 'SI1-A10001',
        },
      ],
    },
    {
      cataloguePriceType: 'Flat',
      catalogueItemType: 'AssociatedService',
      catalogueItemName: '55 Training',
      catalogueItemId: '10000-S-003',
      provisioningType: 'Declarative',
      price: 55.55,
      itemUnitDescription: 'per Day',
      costPerYear: 5555.55,
      serviceRecipients: [
        {
          name: 'Blue Mountain Medical Practice',
          odsCode: 'A10001',
          itemId: 'C000001-01-A10001-34',
          serviceInstanceId: 'SI1-A10001',
          quantity: 55,
          deliveryDate: '2020-09-25',
        },
      ],
    },
  ],
  totalOneOffCost: 101.1111999,
  totalRecurringCostPerYear: 1981.028,
  totalRecurringCostPerMonth: 191.691,
  totalOwnershipCost: 2345.430,
};

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1')
    .reply(200, mockOrder);
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

fixture('Order Summary for complete order - with saved data')
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

test('should render the one off cost table footer with one off cost total price', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const oneOffCostTableFooter = Selector('[data-test-id="one-off-cost-table"] tfoot');
  const row1 = oneOffCostTableFooter.find('[data-test-id="table-row-0"]');
  const totalCostLabelCell = row1.find('div[data-test-id="total-cost-label"]');
  const totalCostValueCell = row1.find('div[data-test-id="total-cost-value"]');

  await t
    .expect(await extractInnerText(totalCostLabelCell)).eql(content.oneOffCostTableFooter.cellInfo.totalOneOffCostLabel.data)
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
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(0))).eql('Red Mountain Medical Practice (A10002)')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(1))).eql('C000001-01-A10002-24')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(2))).eql('OnDemand associated service')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(3))).eql('SI1-A10002')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(4))).eql('0.70 per fragment')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(5))).eql('600 per month')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(6))).eql('25 September 2020')
    .expect(await extractInnerText(recurringCostRow0.find('td').nth(7))).eql('5,040.00')

    .expect(await extractInnerText(recurringCostRow1.find('td').nth(0))).eql('Red Mountain Medical Practice (A10002)')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(1))).eql('C000001-01-A10002-6')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(2))).eql('OnDemand Consultation')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(3))).eql('SI1-A10002')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(4))).eql('1.33 per consultation')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(5))).eql('4 per year')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(6))).eql('25 September 2020')
    .expect(await extractInnerText(recurringCostRow1.find('td').nth(7))).eql('63.84')

    .expect(await extractInnerText(recurringCostRow2.find('td').nth(0))).eql('Yellow Mountain Medical Practice (A10003)')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(1))).eql('C000001-01-A10003-5')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(2))).eql('Patient Consultation')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(3))).eql('SI1-A10003')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(4))).eql('106.025 per patient per month')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(5))).eql('12 per year')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(6))).eql('25 September 2020')
    .expect(await extractInnerText(recurringCostRow2.find('td').nth(7))).eql('15,267.60')

    .expect(await extractInnerText(recurringCostRow3.find('td').nth(0))).eql('Red Mountain Medical Practice (A10002)')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(1))).eql('C000001-01-A10002-3')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(2))).eql('Remote Consultation')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(3))).eql('SI1-A10002')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(4))).eql('207.917 per practice per month')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(5))).eql('12 per year')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(6))).eql('25 September 2020')
    .expect(await extractInnerText(recurringCostRow3.find('td').nth(7))).eql('29,939.90')

    .expect(await extractInnerText(recurringCostRow4.find('td').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(1))).eql('C000001-01-A10001-4')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(2))).eql('Remote Consultation')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(3))).eql('SI1-A10001')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(4))).eql('207.9161 per practice per month')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(5))).eql('12 per year')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(6))).eql('25 September 2020')
    .expect(await extractInnerText(recurringCostRow4.find('td').nth(7))).eql('29,939.90')

    .expect(await extractInnerText(recurringCostRow5.find('td').nth(0))).eql('Yellow Mountain Medical Practice (A10003)')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(1))).eql('C000001-01-A10003-1')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(2))).eql('Some catalogue name')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(3))).eql('SI1-B81046')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(4))).eql('1.26 per patient per year')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(5))).eql('3,415 per month')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(6))).eql('6 July 2020')
    .expect(await extractInnerText(recurringCostRow5.find('td').nth(7))).eql('4,302.90')

    .expect(await extractInnerText(recurringCostRow6.find('td').nth(0))).eql('Blue Mountain Medical Practice (A10001)')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(1))).eql('C000001-01-A10001-2')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(2))).eql('Some catalogue name')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(3))).eql('SI1-A10001')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(4))).eql('500.261 per licence')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(5))).eql('12')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(6))).eql('6 August 2020')
    .expect(await extractInnerText(recurringCostRow6.find('td').nth(7))).eql('6,003.13');
});

test('should render the recurring cost table footer with the totals provided', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const recurringCostTableFooter = Selector('[data-test-id="recurring-cost-table"] tfoot');

  const row1 = recurringCostTableFooter.find('[data-test-id="table-row-0"]');
  const totalYearCostLabelCell = row1.find('div[data-test-id="total-year-cost-label"]');
  const totalYearCostValueCell = row1.find('div[data-test-id="total-year-cost-value"]');

  const row2 = recurringCostTableFooter.find('[data-test-id="table-row-1"]');
  const totalMonthlyCostLabelCell = row2.find('div[data-test-id="total-monthly-cost-label"]');
  const totalMonthlyCostValueCell = row2.find('div[data-test-id="total-monthly-cost-value"]');

  const row3 = recurringCostTableFooter.find('[data-test-id="table-row-2"]');
  const totalOwnershipCostLabelCell = row3.find('div[data-test-id="total-ownership-cost-label"]');
  const totalOwnershipCostValueCell = row3.find('div[data-test-id="total-ownership-cost-value"]');

  const row4 = recurringCostTableFooter.find('[data-test-id="table-row-3"]');
  const totalOwnershipTermsLabelCell = row4.find('div[data-test-id="total-ownership-terms"]');

  await t
    .expect(await extractInnerText(totalYearCostLabelCell)).eql(content.recurringCostTableFooter.cellInfo.totalOneYearCostLabel.data)
    .expect(await extractInnerText(totalYearCostValueCell)).eql('1,981.03')

    .expect(await extractInnerText(totalMonthlyCostLabelCell)).eql(content.recurringCostTableFooter.cellInfo.totalMonthlyCostLabel.data)
    .expect(await extractInnerText(totalMonthlyCostValueCell)).eql('191.69')

    .expect(await extractInnerText(totalOwnershipCostLabelCell)).eql(content.recurringCostTableFooter.cellInfo.totalOwnershipCostLabel.data)
    .expect(await extractInnerText(totalOwnershipCostValueCell)).eql('2,345.43')

    .expect(await extractInnerText(totalOwnershipTermsLabelCell)).eql(content.recurringCostTableFooter.cellInfo.totalOwnershipTerms.data);
});

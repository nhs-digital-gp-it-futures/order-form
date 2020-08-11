import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../config';
import { formatDate } from '../../../../helpers/common/dateFormatter';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/summary';

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1')
    .reply(200, { description: 'some order description' });
};

const pageSetup = async (setup = { withAuth: true, getRoute: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Order Summary Summary - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ withAuth: false, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render Summary page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="summary-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-1 for backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-1');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="summary-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} order-1`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="summary-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the orderDescription', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescriptionHeading = Selector('h3[data-test-id="order-description-heading"]');
  const orderDescription = Selector('h4[data-test-id="order-description"]');

  await t
    .expect(await extractInnerText(orderDescriptionHeading)).eql(content.orderDescriptionHeading)
    .expect(await extractInnerText(orderDescription)).eql('some order description');
});

test('should render the get order summary top button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderSummaryButton = Selector('[data-test-id="summary-page-orderSummaryButton-top"]');

  await t
    .expect(await extractInnerText(orderSummaryButton)).eql(content.orderSummaryButtonText);
});

test('should render the get order summary button top link with href /order/organisation/order-id/summary?print=true', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderSummaryButton = Selector('[data-test-id="summary-page-orderSummaryButton-top"] a');

  await t
    .expect(orderSummaryButton.getAttribute('href')).eql('/order/organisation/order-1/summary?print=true');
});

test('should render the order summary button top information', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="summary-page-orderSummaryButtonInfo-top"]');

  await t
    .expect(await extractInnerText(description)).eql(content.orderSummaryButtonInfoText);
});

test('should render the get order summary bottom button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderSummaryButton = Selector('[data-test-id="summary-page-orderSummaryButton-bottom"]');

  await t
    .expect(await extractInnerText(orderSummaryButton)).eql(content.orderSummaryButtonText);
});

test('should render the get order summary button bottom link with href /order/organisation/order-id/summary?print=true', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderSummaryButton = Selector('[data-test-id="summary-page-orderSummaryButton-bottom"] a');
  await t
    .expect(orderSummaryButton.getAttribute('href')).eql('/order/organisation/order-1/summary?print=true');
});

test('should render the order summary button bottom information', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="summary-page-orderSummaryButtonInfo-bottom"]');

  await t
    .expect(await extractInnerText(description)).eql(content.orderSummaryButtonInfoText);
});

test('should render the date summary created', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const formattedCurrentDate = formatDate(new Date());
  const dateSummaryCreated = Selector('[data-test-id="date-summary-created"]');

  await t
    .expect(await extractInnerText(dateSummaryCreated)).eql(`${content.dateSummaryCreatedLabel} ${formattedCurrentDate}`);
});

test('should render the Call-off ordering party and supplier table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const calloffAndSupplierTable = Selector('[data-test-id="calloff-and-supplier"]');
  const calloffColumnHeading = calloffAndSupplierTable.find('[data-test-id="column-heading-0"]');
  const supplierColumnHeading = calloffAndSupplierTable.find('[data-test-id="column-heading-1"]');

  await t
    .expect(await extractInnerText(calloffColumnHeading)).eql('Call-off Ordering Party')
    .expect(await extractInnerText(supplierColumnHeading)).eql('Supplier');
});

test('should not render the Call-off ordering party and supplier details in the table when data not provided', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const calloffAndSupplierTable = Selector('[data-test-id="calloff-and-supplier"]');
  const calloffAndSupplierDetails = calloffAndSupplierTable.find('[data-test-id="table-row-0"]');
  const calloffPartyDetails = calloffAndSupplierDetails.find('div[data-test-id="call-off-party"]');
  const supplierDetails = calloffAndSupplierDetails.find('div[data-test-id="supplier"]');

  await t
    .expect(calloffAndSupplierDetails.exists).ok()
    .expect(calloffPartyDetails.exists).notOk()
    .expect(supplierDetails.exists).notOk();
});

test('should render the commencement date label only when data not provided', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const commencementDate = Selector('[data-test-id="commencement-date"]');

  await t
    .expect(await extractInnerText(commencementDate)).eql(`${content.commencementDateLabel}`);
});

test('should render the one off cost heading and description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const oneOffCostHeading = Selector('h3[data-test-id="one-off-cost-heading"]');
  const oneOffCostDescription = Selector('h4[data-test-id="one-off-cost-description"]');

  await t
    .expect(await extractInnerText(oneOffCostHeading)).eql(content.oneOffCostHeading)
    .expect(await extractInnerText(oneOffCostDescription)).eql(content.oneOffCostDescription);
});

test('should render the one off cost table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const oneOffCostTable = Selector('[data-test-id="one-off-cost-table"]');
  const recipientNameColumnHeading = oneOffCostTable.find('[data-test-id="column-heading-0"]');
  const itemIdColumnHeading = oneOffCostTable.find('[data-test-id="column-heading-1"]');
  const itemNameColumnHeading = oneOffCostTable.find('[data-test-id="column-heading-2"]');
  const priceUnitColumnHeading = oneOffCostTable.find('[data-test-id="column-heading-3"]');
  const quantityColumnHeading = oneOffCostTable.find('[data-test-id="column-heading-4"]');
  const itemCostColumnHeading = oneOffCostTable.find('[data-test-id="column-heading-5"]');

  await t
    .expect(await extractInnerText(recipientNameColumnHeading)).eql('Recipient name (ODS code)')
    .expect(await extractInnerText(itemIdColumnHeading)).eql('Item ID')
    .expect(await extractInnerText(itemNameColumnHeading)).eql('Item name')
    .expect(await extractInnerText(priceUnitColumnHeading)).eql('Price unit of order (£)')
    .expect(await extractInnerText(quantityColumnHeading)).eql('Quantity')
    .expect(await extractInnerText(itemCostColumnHeading)).eql('Item cost (£)');
});

test('should render the one off cost totals table with 0.00 for the price', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const oneOffCostTotalsTable = Selector('[data-test-id="one-off-cost-totals-table"]');
  const row1 = oneOffCostTotalsTable.find('[data-test-id="table-row-0"]');
  const totalCostLabelCell = row1.find('div[data-test-id="total-cost-label"]');
  const totalCostValueCell = row1.find('div[data-test-id="total-cost-value"]');

  await t
    .expect(await extractInnerText(totalCostLabelCell)).eql(content.oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.data)
    .expect(await extractInnerText(totalCostValueCell)).eql('0.00');
});

test('should render the recurring cost heading and description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const recurringCostHeading = Selector('h3[data-test-id="recurring-cost-heading"]');
  const recurringCostDescription = Selector('h4[data-test-id="recurring-cost-description"]');

  await t
    .expect(await extractInnerText(recurringCostHeading)).eql(content.recurringCostHeading)
    .expect(await extractInnerText(recurringCostDescription)).eql(content.recurringCostDescription);
});

test('should render the recurring cost table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const recurringCostTable = Selector('[data-test-id="recurring-cost-table"]');
  const recipientNameColumnHeading = recurringCostTable.find('[data-test-id="column-heading-0"]');
  const itemIdColumnHeading = recurringCostTable.find('[data-test-id="column-heading-1"]');
  const itemNameColumnHeading = recurringCostTable.find('[data-test-id="column-heading-2"]');
  const priceUnitColumnHeading = recurringCostTable.find('[data-test-id="column-heading-3"]');
  const quantityColumnHeading = recurringCostTable.find('[data-test-id="column-heading-4"]');
  const plannedDateColumnHeading = recurringCostTable.find('[data-test-id="column-heading-5"]');
  const itemCostColumnHeading = recurringCostTable.find('[data-test-id="column-heading-6"]');

  await t
    .expect(await extractInnerText(recipientNameColumnHeading)).eql('Recipient name (ODS code)')
    .expect(await extractInnerText(itemIdColumnHeading)).eql('Item ID')
    .expect(await extractInnerText(itemNameColumnHeading)).eql('Item name')
    .expect(await extractInnerText(priceUnitColumnHeading)).eql('Price unit of order (£)')
    .expect(await extractInnerText(quantityColumnHeading)).eql('Quantity /period')
    .expect(await extractInnerText(plannedDateColumnHeading)).eql('Planned delivery date')
    .expect(await extractInnerText(itemCostColumnHeading)).eql('Item cost per year (£)');
});

test('should render the recurring cost totals table with 0.00 for the price', async (t) => {
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
    .expect(await extractInnerText(totalYearCostValueCell)).eql('0.00')

    .expect(await extractInnerText(totalMonthlyCostLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.data)
    .expect(await extractInnerText(totalMonthlyCostValueCell)).eql('0.00')

    .expect(await extractInnerText(totalOwnershipCostLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.data)
    .expect(await extractInnerText(totalOwnershipCostValueCell)).eql('0.00')

    .expect(await extractInnerText(totalOwnershipTermsLabelCell)).eql(content.recurringCostTotalsTable.cellInfo.totalOwnershipTerms.data);
});

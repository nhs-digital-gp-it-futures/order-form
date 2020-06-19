import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { organisationApiUrl, solutionsApiUrl } from '../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/order-item-id';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const selectedSolutionIdState = ClientFunction(() => {
  const cookieValue = 'solution-1';

  document.cookie = `selectedSolutionId=${cookieValue}`;
});

const selectedRecipientIdState = ClientFunction(() => {
  const cookieValue = 'recipient-1';

  document.cookie = `selectedRecipientId=${cookieValue}`;
});

const selectedPriceIdState = ClientFunction(() => {
  const cookieValue = 'price-1';

  document.cookie = `selectedPriceId=${cookieValue}`;
});

const selectedPrice = {
  priceId: 1,
  provisioningModel: 'OnDemand',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.1,
};

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/solutions/solution-1')
    .reply(200, { id: 'solution-1', name: 'Solution One' });
  nock(organisationApiUrl)
    .get('/api/v1/ods/recipient-1')
    .reply(200, { odsCode: 'recipient-1', name: 'Recipient 1' });
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const pageSetup = async (withAuth = true) => {
  if (withAuth) {
    mocks();
    await setCookies();
    await selectedRecipientIdState();
    await selectedSolutionIdState();
    await selectedPriceIdState();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions - recipient page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup(false);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render Catalogue-solutions order-item page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="order-item-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id/catalogue-solutions/select/solution/recipient when click on backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions/select/solution/recipient');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql('Solution One information for Recipient 1 (recipient-1)');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-item-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render legend with mainAdvice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const mainAdvice = Selector('legend');

  await t
    .expect(mainAdvice.exists).ok()
    .expect(await extractInnerText(mainAdvice)).eql(content.questions.plannedDate.mainAdvice);
});

test('should render additionalAdvice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const additionalAdvice = Selector('[data-test-id="date-field-input"] span.nhsuk-hint');

  await t
    .expect(additionalAdvice.exists).ok()
    .expect(await extractInnerText(additionalAdvice)).eql(content.questions.plannedDate.additionalAdvice);
});

test('should render labels for day, month and year inputs', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const labels = Selector('label');
  const dayLabel = labels.nth(0);
  const monthLabel = labels.nth(1);
  const yearLabel = labels.nth(2);

  await t
    .expect(dayLabel.exists).ok()
    .expect(await extractInnerText(dayLabel)).eql('Day')
    .expect(monthLabel.exists).ok()
    .expect(await extractInnerText(monthLabel)).eql('Month')
    .expect(yearLabel.exists).ok()
    .expect(await extractInnerText(yearLabel)).eql('Year');
});

test('should render input fields for day, month and year', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const inputFields = Selector('#plannedDeliveryDate input:not([name=_csrf])');
  const dayInput = inputFields.nth(0);
  const monthInput = inputFields.nth(1);
  const yearInput = inputFields.nth(2);

  await t
    .expect(dayInput.exists).ok()
    .expect(dayInput.getAttribute('id')).eql('plannedDeliveryDate-day')
    .expect(dayInput.getAttribute('name')).eql('plannedDeliveryDate-day')
    .expect(dayInput.getAttribute('type')).eql('number')
    .expect(monthInput.exists).ok()
    .expect(monthInput.getAttribute('id')).eql('plannedDeliveryDate-month')
    .expect(monthInput.getAttribute('name')).eql('plannedDeliveryDate-month')
    .expect(monthInput.getAttribute('type')).eql('number')
    .expect(yearInput.exists).ok()
    .expect(yearInput.getAttribute('id')).eql('plannedDeliveryDate-year')
    .expect(yearInput.getAttribute('name')).eql('plannedDeliveryDate-year')
    .expect(yearInput.getAttribute('type')).eql('number');
});

test('should render a text field for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const quantity = Selector('[data-test-id="question-quantity"]');
  const quantityLabel = quantity.find('label.nhsuk-label');

  await t
    .expect(quantity.exists).ok()
    .expect(await extractInnerText(quantityLabel)).eql(content.questions.quantity.mainAdvice)
    .expect(quantity.find('input').count).eql(1);
});

test('should render an expandable section for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const expandableSection = Selector('[data-test-id="view-section-quantity-id"]');

  await t
    .expect(expandableSection.exists).ok()
    .expect(await extractInnerText(expandableSection)).eql(content.questions.quantity.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.questions.quantity.expandableSection.innerComponent);
});

test('should render a selectEstimationPeriod question as radio button options', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectEstimationPeriodRadioOptions = Selector('[data-test-id="question-selectEstimationPeriod"]');

  await t
    .expect(selectEstimationPeriodRadioOptions.exists).ok()
    .expect(await extractInnerText(selectEstimationPeriodRadioOptions.find('legend'))).eql(content.questions.estimationPeriod.mainAdvice)
    .expect(selectEstimationPeriodRadioOptions.find('input').count).eql(2)

    .expect(selectEstimationPeriodRadioOptions.find('input').nth(0).getAttribute('value')).eql('perMonth')
    .expect(await extractInnerText(selectEstimationPeriodRadioOptions.find('label').nth(0))).eql('Per month')

    .expect(selectEstimationPeriodRadioOptions.find('input').nth(1).getAttribute('value')).eql('perYear')
    .expect(await extractInnerText(selectEstimationPeriodRadioOptions.find('label').nth(1))).eql('Per year');
});

test('should render an expandable section for the select estimation period', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const expandableSection = Selector('[data-test-id="view-section-estimation-period-id"]');

  await t
    .expect(expandableSection.exists).ok()
    .expect(await extractInnerText(expandableSection)).eql(content.questions.estimationPeriod.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.questions.estimationPeriod.expandableSection.innerComponent);
});

test('should render the unsubmitted orders table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const unsubmittedTable = Selector('div[data-test-id="price-table"]');
  const unsubmittedColumnHeading1 = unsubmittedTable.find('[data-test-id="column-heading-0"]');
  const unsubmittedColumnHeading2 = unsubmittedTable.find('[data-test-id="column-heading-1"]');

  await t
    .expect(unsubmittedTable.exists).ok()
    .expect(unsubmittedColumnHeading1.exists).ok()
    .expect(await extractInnerText(unsubmittedColumnHeading1)).eql(content.columnInfo[0].data)
    .expect(unsubmittedColumnHeading2.exists).ok()
    .expect(await extractInnerText(unsubmittedColumnHeading2)).eql(content.columnInfo[1].data);
});

test('should render the price table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="price-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const priceInput = row.find('[data-test-id="question-price-input-id"] input');
  const expandableSection = row.find('[data-test-id="view-section-input-id"]');
  const orderUnit = row.find('div[data-test-id="order-unit-id"]');

  await t
    .expect(row.exists).ok()
    .expect(priceInput.exists).ok()
    .expect(priceInput.getAttribute('value')).eql(content.data[0][0].question.data)
    .expect(expandableSection.exists).ok()
    .expect(await extractInnerText(expandableSection)).eql(content.data[0][0].expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.data[0][0].expandableSection.innerComponent)
    .expect(orderUnit.exists).ok()
    .expect(await extractInnerText(orderUnit)).eql(content.data[0][1].data);
});

test('should render the delete button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="delete-button"] a');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.deleteButtonText);
});

test('should render the save button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});

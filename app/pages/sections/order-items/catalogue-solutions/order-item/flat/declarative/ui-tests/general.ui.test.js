import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl } from '../../../../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/neworderitem';

const getLocation = ClientFunction(() => document.location.href);

const selectedPrice = {
  priceId: 1,
  provisioningType: 'Declarative',
  type: 'Flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'license',
    description: 'per license',
  },
  timeUnit: {
    name: 'month',
    description: 'per month',
  },
  price: 10.015,
};

const authTokenInSession = JSON.stringify({
  id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
});
const solutionIdInSession = 'solution-1';
const solutionNameInSession = 'solution-name';
const selectedRecipientIdInSession = 'recipient-1';
const selectedRecipientNameInSession = 'recipient-name';
const selectedPriceIdInSession = 'price-1';

const orderItemPageDataInSession = JSON.stringify({
  solutionId: solutionIdInSession,
  solutionName: solutionNameInSession,
  serviceRecipientId: selectedRecipientIdInSession,
  serviceRecipientName: selectedRecipientNameInSession,
  selectedPrice,
});

const setState = ClientFunction((key, value) => {
  document.cookie = `${key}=${value}`;
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/solutions/solution-1')
    .reply(200, { id: 'solution-1', name: 'Solution One' });
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const pageSetup = async (withAuth = true, postRoute = false) => {
  if (withAuth) {
    mocks();
    await setState('fakeToken', authTokenInSession);
    await setState('selectedRecipientId', selectedRecipientIdInSession);
    await setState('selectedRecipientName', selectedRecipientNameInSession);
    await setState('selectedSolutionId', solutionIdInSession);
    await setState('selectedPriceId', selectedPriceIdInSession);
    if (postRoute) {
      await setState('orderItemPageData', orderItemPageDataInSession);
    }
  }
};

fixture('Catalogue-solutions - flat declarative - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
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

test('should render the price table headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const priceTable = Selector('div[data-test-id="price-table"]');
  const priceColumnHeading = priceTable.find('[data-test-id="column-heading-0"]');
  const unitColumnHeading = priceTable.find('[data-test-id="column-heading-1"]');

  await t
    .expect(priceTable.exists).ok()
    .expect(priceColumnHeading.exists).ok()
    .expect(await extractInnerText(priceColumnHeading)).eql(content.addPriceTable.columnInfo[0].data)
    .expect(unitColumnHeading.exists).ok()
    .expect(await extractInnerText(unitColumnHeading)).eql(content.addPriceTable.columnInfo[1].data);
});

test('should render the price table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="price-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const priceInput = row.find('[data-test-id="question-price"] input');
  const expandableSection = row.find('[data-test-id="view-section-input-id"]');
  const orderUnit = row.find('div[data-test-id="unit-of-order"]');

  await t
    .expect(row.exists).ok()
    .expect(priceInput.exists).ok()
    .expect(priceInput.getAttribute('value')).eql(selectedPrice.price.toString())
    .expect(expandableSection.exists).ok()
    .expect(await extractInnerText(expandableSection)).eql(content.addPriceTable.cellInfo.price.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.addPriceTable.cellInfo.price.expandableSection.innerComponent)
    .expect(orderUnit.exists).ok()
    .expect(await extractInnerText(orderUnit)).eql(`${selectedPrice.itemUnit.description} ${selectedPrice.timeUnit.description}`);
});

test('should render select quantity field as errors with error message when no quantity entered causing validation error', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const orderItemPage = Selector('[data-test-id="order-item-page"]');
  const saveButton = Selector('[data-test-id="save-button"] button');
  const quantityField = orderItemPage.find('[data-test-id="question-quantity"]');

  await t
    .expect(saveButton.exists).ok()
    .expect(quantityField.find('[data-test-id="text-field-input-error"]').exists).notOk()
    .click(saveButton);

  await t
    .expect(quantityField.find('[data-test-id="text-field-input-error"]').exists).ok()
    .expect(await extractInnerText(quantityField.find('#quantity-error'))).contains(content.errorMessages.QuantityRequired);
});

test('should render select price field as errors with error message when no price entered causing validation error', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const orderItemPage = Selector('[data-test-id="order-item-page"]');
  const saveButton = Selector('[data-test-id="save-button"] button');
  const priceField = orderItemPage.find('[data-test-id="question-price"]');

  await t
    .expect(priceField.find('[data-test-id="text-field-input-error"]').exists).notOk()
    .selectText(priceField.find('input')).pressKey('delete')
    .click(saveButton);

  await t
    .expect(priceField.find('[data-test-id="text-field-input-error"]').exists).ok()
    .expect(await extractInnerText(priceField.find('#price-error'))).contains(content.errorMessages.PriceRequired);
});

test('should anchor to the quantity field when clicking on the quantity required error link in errorSummary ', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(continueButton);

  await t
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(1))
    .expect(getLocation()).eql(`${pageUrl}#quantity`);
});

test('should anchor to the quantity field when clicking on the numerical quantity error link in errorSummary ', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const quantity = Selector('[data-test-id="question-quantity"]');

  await t
    .expect(errorSummary.exists).notOk()
    .typeText(quantity, 'blah', { paste: true })
    .click(continueButton);

  await t
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(1))
    .expect(getLocation()).eql(`${pageUrl}#quantity`);
});

test('should anchor to the price field when clicking on the price required error link in errorSummary ', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const priceInput = Selector('[data-test-id="question-price"] input');

  await t
    .expect(errorSummary.exists).notOk()
    .selectText(priceInput).pressKey('delete')
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .click(errorSummary.find('li a').nth(2))
    .expect(getLocation()).eql(`${pageUrl}#price`);
});

test('should anchor to the price field when clicking on the numerical price error link in errorSummary ', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const priceInput = Selector('[data-test-id="question-price"] input');

  await t
    .expect(errorSummary.exists).notOk()
    .typeText(priceInput, 'blah', { paste: true })
    .click(continueButton);

  await t
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(2))
    .expect(getLocation()).eql(`${pageUrl}#price`);
});

import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { organisationApiUrl, solutionsApiUrl } from '../../../../../../../config';

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

const solutionNameState = ClientFunction(() => {
  const cookieValue = 'solution-name';

  document.cookie = `solutionName=${cookieValue}`;
});

const selectedRecipientIdState = ClientFunction(() => {
  const cookieValue = 'recipient-1';

  document.cookie = `selectedRecipientId=${cookieValue}`;
});

const serviceRecipientNameState = ClientFunction(() => {
  const cookieValue = 'recipient-name';

  document.cookie = `serviceRecipientName=${cookieValue}`;
});

const selectedPriceIdState = ClientFunction(() => {
  const cookieValue = 'price-1';

  document.cookie = `selectedPriceId=${cookieValue}`;
});

const selectedPrice = {
  priceId: 2,
  provisioningType: 'ondemand',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'patient',
    description: 'per patient',
  },
  price: '1.64',
};

const selectedPriceState = ClientFunction((selectedPriceValue) => {
  const cookieValue = JSON.stringify(selectedPriceValue);

  document.cookie = `selectedPrice=${cookieValue}`;
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/solutions/solution-1')
    .reply(200, { id: 'solution-1', name: 'Solution One' });
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const pageSetup = async (withAuth = true, postRoute = false, priceValidation = false) => {
  if (withAuth) {
    mocks(priceValidation);
    await setCookies();
    await selectedRecipientIdState();
    await selectedSolutionIdState();
    await selectedPriceIdState();
    if (postRoute) {
      await solutionNameState();
      await serviceRecipientNameState();
      await selectedPriceState(selectedPrice);
    }
  }
};

fixture('Catalogue-solutions - recipient page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should render legend with mainAdvice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const mainAdvice = Selector('legend');

  await t
    .expect(mainAdvice.exists).ok()
    .expect(await extractInnerText(mainAdvice)).eql(content.questions.plannedDeliveryDate.mainAdvice);
});

test('should render additionalAdvice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const additionalAdvice = Selector('[data-test-id="date-field-input"] span.nhsuk-hint');

  await t
    .expect(additionalAdvice.exists).ok()
    .expect(await extractInnerText(additionalAdvice)).eql(content.questions.plannedDeliveryDate.additionalAdvice);
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
    .expect(await extractInnerText(selectEstimationPeriodRadioOptions.find('legend')))
    .eql(content.questions.selectEstimationPeriod.mainAdvice)
    .expect(selectEstimationPeriodRadioOptions.find('input').count).eql(2)

    .expect(selectEstimationPeriodRadioOptions.find('input').nth(0).getAttribute('value')).eql('perMonth')
    .expect(await extractInnerText(selectEstimationPeriodRadioOptions.find('label').nth(0))).eql('Per month')
    .expect(selectEstimationPeriodRadioOptions.find('input').nth(0).hasAttribute('checked')).notOk()

    .expect(selectEstimationPeriodRadioOptions.find('input').nth(1).getAttribute('value')).eql('perYear')
    .expect(await extractInnerText(selectEstimationPeriodRadioOptions.find('label').nth(1))).eql('Per year')
    .expect(selectEstimationPeriodRadioOptions.find('input').nth(1).hasAttribute('checked')).notOk();
});

test('should render an expandable section for the select estimation period', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const expandableSection = Selector('[data-test-id="view-section-estimation-period-id"]');

  await t
    .expect(expandableSection.exists).ok()
    .expect(await extractInnerText(expandableSection)).eql(content.questions.selectEstimationPeriod.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.questions.selectEstimationPeriod.expandableSection.innerComponent);
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
    .expect(priceInput.getAttribute('value')).eql(selectedPrice.price)
    .expect(expandableSection.exists).ok()
    .expect(await extractInnerText(expandableSection)).eql(content.addPriceTable.cellInfo.price.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.addPriceTable.cellInfo.price.expandableSection.innerComponent)
    .expect(orderUnit.exists).ok()
    .expect(await extractInnerText(orderUnit)).eql(selectedPrice.itemUnit.description);
});

// test('should render select quantity field as errors with error message when no quantity entered causing validation error', async (t) => {
//   await pageSetup(true, true);
//   await t.navigateTo(pageUrl);

//   const orderItemPage = Selector('[data-test-id="order-item-page"]');
//   const saveButton = Selector('[data-test-id="save-button"] button');
//   const quantityField = orderItemPage.find('[data-test-id="question-quantity"]');
//   const button = Selector('[data-test-id="save-button"] button');

//   await t
//     .expect(button.exists).ok()
//     .expect(quantityField.find('[data-test-id="text-field-input-error"]').exists).notOk()
//     .click(saveButton);

//   await t
//     .expect(quantityField.find('[data-test-id="text-field-input-error"]').exists).ok()
//     .expect(await extractInnerText(quantityField.find('#quantity-error'))).contains('Enter a quantity');
// });

// test('should render select price field as errors with error message when no price entered causing validation error', async (t) => {
//   await pageSetup(true, true);
//   await t.navigateTo(pageUrl);

//   const orderItemPage = Selector('[data-test-id="order-item-page"]');
//   const saveButton = Selector('[data-test-id="save-button"] button');
//   const priceField = orderItemPage.find('[data-test-id="question-price"]');

//   await t
//     .expect(priceField.find('[data-test-id="text-field-input-error"]').exists).notOk()
//     .selectText(priceField.find('input')).pressKey('delete')
//     .click(saveButton);

//   await t
//     .expect(priceField.find('[data-test-id="text-field-input-error"]').exists).ok()
//     .expect(await extractInnerText(priceField.find('#price-error'))).contains('Enter a price');
// });

// test('should anchor to the quantity field when clicking on the quantity required error link in errorSummary ', async (t) => {
//   await pageSetup(true, true);
//   await t.navigateTo(pageUrl);

//   const continueButton = Selector('[data-test-id="save-button"] button');
//   const errorSummary = Selector('[data-test-id="error-summary"]');

//   await t
//     .expect(errorSummary.exists).notOk()
//     .click(continueButton);

//   await t
//     .expect(errorSummary.exists).ok()

//     .click(errorSummary.find('li a').nth(0))
//     .expect(getLocation()).eql(`${pageUrl}#quantity`);
// });

// test('should anchor to the quantity field when clicking on the numerical quantity error link in errorSummary ', async (t) => {
//   await pageSetup(true, true);
//   await t.navigateTo(pageUrl);

//   const continueButton = Selector('[data-test-id="save-button"] button');
//   const errorSummary = Selector('[data-test-id="error-summary"]');
//   const quantity = Selector('[data-test-id="question-quantity"]');

//   await t
//     .expect(errorSummary.exists).notOk()
//     .typeText(quantity, 'blah', { paste: true })
//     .click(continueButton);

//   await t
//     .expect(errorSummary.exists).ok()

//     .click(errorSummary.find('li a').nth(0))
//     .expect(getLocation()).eql(`${pageUrl}#quantity`);
// });

// test('should anchor to the price field when clicking on the price required error link in errorSummary ', async (t) => {
//   await pageSetup(true, true);
//   await t.navigateTo(pageUrl);

//   const saveButton = Selector('[data-test-id="save-button"] button');
//   const errorSummary = Selector('[data-test-id="error-summary"]');
//   const priceInput = Selector('[data-test-id="question-price"] input');

//   await t
//     .expect(errorSummary.exists).notOk()
//     .selectText(priceInput).pressKey('delete')
//     .click(saveButton);

//   await t
//     .expect(errorSummary.exists).ok()

//     .click(errorSummary.find('li a').nth(1))
//     .expect(getLocation()).eql(`${pageUrl}#price`);
// });

// test('should anchor to the price field when clicking on the numerical price error link in errorSummary ', async (t) => {
//   await pageSetup(true, true);
//   await t.navigateTo(pageUrl);

//   const continueButton = Selector('[data-test-id="save-button"] button');
//   const errorSummary = Selector('[data-test-id="error-summary"]');
//   const priceInput = Selector('[data-test-id="question-price"] input');

//   await t
//     .expect(errorSummary.exists).notOk()
//     .typeText(priceInput, 'blah', { paste: true })
//     .click(continueButton);

//   await t
//     .expect(errorSummary.exists).ok()

//     .click(errorSummary.find('li a').nth(1))
//     .expect(getLocation()).eql(`${pageUrl}#price`);
// });

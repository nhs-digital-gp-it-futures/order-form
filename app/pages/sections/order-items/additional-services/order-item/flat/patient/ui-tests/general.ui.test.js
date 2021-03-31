import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl } from '../../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/additional-services/neworderitem';

const getLocation = ClientFunction(() => document.location.href);

const selectedPrice = {
  priceId: 1,
  provisioningType: 'Patient',
  type: 'Flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.11,
};

const itemIdInSession = 'item-1';
const itemNameInSession = 'Item One';
const catalogueSolutionIdInSession = 'solution-1';
const selectedRecipientIdInSession = 'recipient-1';
const selectedRecipientNameInSession = 'recipient-name';
const selectedPriceIdInSession = 'price-1';

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
  catalogueSolutionId: catalogueSolutionIdInSession,
  serviceRecipientId: selectedRecipientIdInSession,
  serviceRecipientName: selectedRecipientNameInSession,
  selectedPrice,
});

const mocks = (mockSelectedPrice) => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, mockSelectedPrice);
};

const defaultPageSetup = {
  withAuth: true, getRoute: true, postRoute: false, mockData: selectedPrice,
};
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks(setup.mockData);
    await setState(ClientFunction)('fakeToken', authTokenInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientId, selectedRecipientIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientName, selectedRecipientNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemId, itemIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemName, itemNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedCatalogueSolutionId, catalogueSolutionIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

// TODO: fix when feature completed
fixture.skip('Additional-services - flat patient - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render a text field for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const quantity = Selector('[data-test-id="question-quantity"]');
  const quantityLabel = quantity.find('label.nhsuk-label');

  await t
    .expect(await extractInnerText(quantityLabel)).eql(content.questions.quantity.mainAdvice)
    .expect(quantity.find('input').count).eql(1);
});

test('should render the price table headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const priceTable = Selector('div[data-test-id="price-table"]');
  const priceColumnHeading = priceTable.find('[data-test-id="column-heading-0"]');
  const unitColumnHeading = priceTable.find('[data-test-id="column-heading-1"]');

  await t
    .expect(await extractInnerText(priceColumnHeading)).eql(content.addPriceTable.columnInfo[0].data)
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
    .expect(priceInput.getAttribute('value')).eql(selectedPrice.price.toString())

    .expect(expandableSection.exists).ok()
    .expect(await extractInnerText(expandableSection)).eql(content.addPriceTable.cellInfo.price.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.addPriceTable.cellInfo.price.expandableSection.innerComponent)

    .expect(await extractInnerText(orderUnit)).eql(selectedPrice.itemUnit.description);
});

test('should render the price with a value of 0 when returned from the API', async (t) => {
  const mockSelectedPrice = { ...selectedPrice, price: 0 };
  await pageSetup({ ...defaultPageSetup, postRoute: true, mockData: mockSelectedPrice });
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="price-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const priceInput = row.find('[data-test-id="question-price"] input');

  await t
    .expect(priceInput.getAttribute('value')).eql(mockSelectedPrice.price.toString());
});

test('should render select quantity field as errors with error message when no quantity entered causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const orderItemPage = Selector('[data-test-id="order-item-page"]');
  const saveButton = Selector('[data-test-id="save-button"] button');
  const quantityField = orderItemPage.find('[data-test-id="question-quantity"]');
  const quantityFieldWithError = quantityField.find('[data-test-id="text-field-input-error"]');

  await t
    .expect(quantityFieldWithError.exists).notOk()
    .click(saveButton);

  await t
    .expect(quantityFieldWithError.exists).ok()
    .expect(await extractInnerText(quantityField.find('#quantity-error'))).contains(content.errorMessages.QuantityRequired);
});

test('should render select price field as errors with error message when no price entered causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const orderItemPage = Selector('[data-test-id="order-item-page"]');
  const saveButton = Selector('[data-test-id="save-button"] button');
  const priceField = orderItemPage.find('[data-test-id="question-price"]');
  const priceFieldWithError = priceField.find('[data-test-id="text-field-input-error"]');

  await t
    .expect(priceFieldWithError.exists).notOk()
    .selectText(priceField.find('input')).pressKey('delete')
    .click(saveButton);

  await t
    .expect(priceFieldWithError.exists).ok()
    .expect(await extractInnerText(priceField.find('#price-error'))).contains(content.errorMessages.PriceRequired);
});

test('should anchor to the quantity field when clicking on the quantity required error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(saveButton);

  await t
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#quantity`);
});

test('should anchor to the quantity field when clicking on the numerical quantity error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const quantity = Selector('[data-test-id="question-quantity"]');

  await t
    .expect(errorSummary.exists).notOk()
    .typeText(quantity, 'blah', { paste: true })
    .click(saveButton);

  await t
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#quantity`);
});

test('should anchor to the price field when clicking on the price required error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const priceInput = Selector('[data-test-id="question-price"] input');

  await t
    .expect(errorSummary.exists).notOk()
    .selectText(priceInput).pressKey('delete')
    .click(saveButton);

  await t
    .click(errorSummary.find('li a').nth(1))
    .expect(getLocation()).eql(`${pageUrl}#price`);
});

test('should anchor to the price field when clicking on the numerical price error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const priceInput = Selector('[data-test-id="question-price"] input');

  await t
    .expect(errorSummary.exists).notOk()
    .typeText(priceInput, 'blah', { paste: true })
    .click(saveButton);

  await t
    .click(errorSummary.find('li a').nth(1))
    .expect(getLocation()).eql(`${pageUrl}#price`);
});

test('should render the solution table headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const solutionTable = Selector('div[data-test-id="solution-table"]');
  const solutionNameColumnHeading = solutionTable.find('[data-test-id="column-heading-0"]');
  const practiceSizeColumnHeading = solutionTable.find('[data-test-id="column-heading-1"]');
  const dateColumnHeading = solutionTable.find('[data-test-id="column-heading-2"]');

  await t
    .expect(solutionTable.exists).ok()
    .expect(solutionNameColumnHeading.exists).ok()
    .expect(await extractInnerText(solutionNameColumnHeading)).eql(content.solutionTable.columnInfo[0].data)
    .expect(practiceSizeColumnHeading.exists).ok()
    .expect(await extractInnerText(practiceSizeColumnHeading)).eql(content.solutionTable.columnInfo[1].data)
    .expect(dateColumnHeading.exists).ok()
    .expect(await extractInnerText(dateColumnHeading)).eql(`${content.solutionTable.columnInfo[2].data}\n${content.solutionTable.columnInfo[2].additionalAdvice}`);
});

test('should render the solution table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="solution-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const solutionName = row.find('div[data-test-id="recipient-name-code-recipient"]');
  const quantityInput = row.find('[data-test-id="question-quantity"] input');
  const practiceSizeExpandableSection = row.find('[data-test-id="view-section-input-id-practice"]');
  const dateInput = row.find('[data-test-id="question-deliveryDate"] input');
  const dayInput = dateInput.nth(0);
  const monthInput = dateInput.nth(1);
  const yearInput = dateInput.nth(2);
  const dateExpandableSection = row.find('[data-test-id="view-section-input-id-date"]');

  await t
    .expect(row.exists).ok()
    .expect(solutionName.exists).ok()
    .expect(await extractInnerText(solutionName)).eql('recipient-name (code)')

    .expect(quantityInput.exists).ok()
    .expect(practiceSizeExpandableSection.exists).ok()
    .expect(await extractInnerText(practiceSizeExpandableSection)).eql(content.solutionTable.cellInfo.quantity.expandableSection.title)
    .expect(practiceSizeExpandableSection.find('details[open]').exists).notOk()
    .click(practiceSizeExpandableSection.find('summary'))
    .expect(practiceSizeExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(practiceSizeExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.innerComponent.replace('<br><br>', ''))

    .expect(dateInput.exists).ok()
    .expect(dayInput.getAttribute('id')).eql('deliveryDate-day')
    .expect(dayInput.getAttribute('name')).eql('deliveryDate-day')
    .expect(dayInput.getAttribute('value')).eql('10')

    .expect(monthInput.getAttribute('id')).eql('deliveryDate-month')
    .expect(monthInput.getAttribute('name')).eql('deliveryDate-month')
    .expect(monthInput.getAttribute('value')).eql('10')

    .expect(yearInput.getAttribute('id')).eql('deliveryDate-year')
    .expect(yearInput.getAttribute('name')).eql('deliveryDate-year')
    .expect(yearInput.getAttribute('value')).eql('2020')

    .expect(dateExpandableSection.exists).ok()
    .expect(await extractInnerText(dateExpandableSection)).eql(content.solutionTable.cellInfo.deliveryDate.expandableSection.title)
    .expect(dateExpandableSection.find('details[open]').exists).notOk()
    .click(dateExpandableSection.find('summary'))
    .expect(dateExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(dateExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.deliveryDate.expandableSection.innerComponent.replace('<br><br>', ''));
});

test('should render an expandable section for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const expandableSection = Selector('[data-test-id="view-section-quantity-id"]');

  await t
    .expect(await extractInnerText(expandableSection)).eql(content.questions.quantity.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.questions.quantity.expandableSection.innerComponent);
});

test('should render solution table as errors with error message when no practice list sizes are entered', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const solutionTableError = Selector('[data-test-id="solution-table-error"]');

  await t
    .expect(solutionTableError.exists).notOk()
    .click(saveButton);

  await t
    .expect(solutionTableError.exists).ok()
    .expect(await extractInnerText(solutionTableError)).contains(content.errorMessages.QuantityRequired);
});

test('should render solution table as errors with error message when no date is entered', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const solutionTableError = Selector('[data-test-id="solution-table-error"]').nth(1);
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(solutionTableError.exists).notOk()
    .selectText(dayInput).pressKey('delete')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(solutionTableError.exists).ok()
    .expect(await extractInnerText(solutionTableError)).contains(content.errorMessages.DeliveryDateRequired);
});

import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl } from '../../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';

const getLocation = ClientFunction(() => document.location.href);

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/neworderitem';

const selectedPrice = {
  priceId: 2,
  provisioningType: 'ondemand',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultationCore',
    description: 'per consultation – core hours',
  },
  price: 1.64,
};
const recipients = [{ name: 'recipient-name', odsCode: 'code' }, { name: 'recipient-name', odsCode: 'code-not-used' }];
const selectedRecipients = ['code'];

const itemIdInSession = 'solution-1';
const itemNameInSession = 'solution-name';
const selectedRecipientIdInSession = 'recipient-1';
const selectedRecipientNameInSession = 'recipient-name';
const selectedPriceIdInSession = 'price-1';
const catalogueSolutionIdInSession = 'solution-1';
const deliveryDateInSession = '2020-10-10';
const recipientsInSession = JSON.stringify(recipients);
const selectedRecipientsInSession = JSON.stringify(selectedRecipients);

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
  serviceRecipientId: selectedRecipientIdInSession,
  serviceRecipientName: selectedRecipientNameInSession,
  selectedPrice,
  recipients,
  deliveryDate: deliveryDateInSession,
  selectedRecipients,
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
    await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
    await setState(ClientFunction)(sessionKeys.catalogueSolutionId, catalogueSolutionIdInSession);
    await setState(ClientFunction)(sessionKeys.plannedDeliveryDate, deliveryDateInSession);
    await setState(ClientFunction)(sessionKeys.recipients, recipientsInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipients, selectedRecipientsInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

fixture('Catalogue-solutions - flat ondemand - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the solution table headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const solutionTable = Selector('div[data-test-id="solution-table"]');
  const solutionNameColumnHeading = solutionTable.find('[data-test-id="column-heading-0"]');
  const quantityColumnHeading = solutionTable.find('[data-test-id="column-heading-1"]');
  const dateColumnHeading = solutionTable.find('[data-test-id="column-heading-2"]');

  await t
    .expect(solutionTable.exists).ok()
    .expect(solutionNameColumnHeading.exists).ok()
    .expect(await extractInnerText(solutionNameColumnHeading)).eql(content.solutionTable.columnInfo[0].data)
    .expect(quantityColumnHeading.exists).ok()
    .expect(await extractInnerText(quantityColumnHeading)).eql(content.solutionTable.columnInfo[1].data)
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
  const quantityExpandableSection = row.find('[data-test-id="view-section-input-id-practice"]');
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
    .expect(quantityExpandableSection.exists).ok()
    .expect(await extractInnerText(quantityExpandableSection)).eql(content.solutionTable.cellInfo.quantity.expandableSection.title)
    .expect(quantityExpandableSection.find('details[open]').exists).notOk()
    .click(quantityExpandableSection.find('summary'))
    .expect(quantityExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(quantityExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.innerComponent.replace('<br><br>', ''))

    .expect(dateInput.exists).ok()
    .expect(dayInput.getAttribute('id')).eql('deliveryDate-day')
    .expect(dayInput.getAttribute('name')).eql('deliveryDate-day')
    .expect(dayInput.getAttribute('type')).eql('number')
    .expect(dayInput.getAttribute('value')).eql('10')

    .expect(monthInput.getAttribute('id')).eql('deliveryDate-month')
    .expect(monthInput.getAttribute('name')).eql('deliveryDate-month')
    .expect(monthInput.getAttribute('type')).eql('number')
    .expect(monthInput.getAttribute('value')).eql('10')

    .expect(yearInput.getAttribute('id')).eql('deliveryDate-year')
    .expect(yearInput.getAttribute('name')).eql('deliveryDate-year')
    .expect(yearInput.getAttribute('type')).eql('number')
    .expect(yearInput.getAttribute('value')).eql('2020')

    .expect(dateExpandableSection.exists).ok()
    .expect(await extractInnerText(dateExpandableSection)).eql(content.solutionTable.cellInfo.deliveryDate.expandableSection.title)
    .expect(dateExpandableSection.find('details[open]').exists).notOk()
    .click(dateExpandableSection.find('summary'))
    .expect(dateExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(dateExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.deliveryDate.expandableSection.innerComponent.replace('<br><br>', ''));
});

test('should only render 1 row', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="solution-table"]');
  const row0 = table.find('[data-test-id="table-row-0"]');
  const row1 = table.find('[data-test-id="table-row-1"]');

  await t
    .expect(row0.exists).ok()
    .expect(row1.exists).notOk();
});

test('should render select price field as errors with error message when no price entered causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const orderItemPage = Selector('[data-test-id="order-item-page"]');
  const saveButton = Selector('[data-test-id="save-button"] button');
  const priceField = orderItemPage.find('[data-test-id="question-price"]');
  const priceInput = priceField.find('Input');
  const priceFieldWithError = priceField.find('[data-test-id="text-field-input-error"]');

  await t
    .expect(priceFieldWithError.exists).notOk()
    .selectText(priceInput).pressKey('delete')
    .click(saveButton);

  await t
    .expect(priceFieldWithError.exists).ok()
    .expect(await extractInnerText(priceField.find('#price-error'))).contains(content.errorMessages.PriceRequired);
});

test('should anchor to the price field when clicking on the price required error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const priceInput = Selector('[data-test-id="question-price"] Input');

  await t
    .expect(errorSummary.exists).notOk()
    .selectText(priceInput).pressKey('delete')
    .click(saveButton);

  await t
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#price`);
});

test('should anchor to the price field when clicking on the numerical price error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const price = Selector('[data-test-id="question-price"]');

  await t
    .expect(errorSummary.exists).notOk()
    .typeText(price, 'blah', { paste: false })
    .click(saveButton);

  await t
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#price`);
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
    .click(errorSummary.find('li a').nth(0))
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
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#price`);
});

test('should render solution table as errors with error message when no quantities are entered', async (t) => {
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

test('should anchor to the table when clicking on the error select quantity link in errorSummary', async (t) => {
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

test('should anchor to the table when clicking on the error select date link in errorSummary', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .selectText(dayInput).pressKey('delete')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .click(errorSummary.find('li a').nth(1))
    .expect(getLocation()).eql(`${pageUrl}#deliveryDate`);
});

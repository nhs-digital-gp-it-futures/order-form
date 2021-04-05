import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl } from '../../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';
import AdditionalServicePageModel from './additionalServicesPageModel.test';

const pageModel = new AdditionalServicePageModel();

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

const recipients = JSON.stringify([
  { odsCode: 'recipient-1', name: 'Recipient 1' },
  { odsCode: 'recipient-2', name: 'Recipient 2' },
]);
const selectedRecipients = ['recipient-2'];

const itemIdInSession = 'item-1';
const itemNameInSession = 'Item One';
const catalogueSolutionIdInSession = 'solution-1';
const selectedRecipientIdInSession = 'recipient-1';
const selectedRecipientNameInSession = 'recipient-name';
const selectedPriceIdInSession = 'price-1';
const deliveryDate = '2020-02-12';

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
    await setState(ClientFunction)(sessionKeys.additionalServiceSelectedPrice, JSON.stringify(selectedPrice));
    await setState(ClientFunction)(sessionKeys.plannedDeliveryDate, deliveryDate);
    await setState(ClientFunction)(sessionKeys.recipients, recipients);
    await setState(ClientFunction)(sessionKeys.selectedRecipients, JSON.stringify(selectedRecipients));
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

fixture('Additional-services - flat patient - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render a text field for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const quantity = Selector('[data-test-id="question-quantity"]');
  const quantityHelpSection = Selector('[data-test-id="view-section-input-id-practice"]');

  await t
    .expect(await extractInnerText(quantityHelpSection)).eql(content.solutionTable.cellInfo.quantity.expandableSection.title)
    .expect(quantity.find('input').count).eql(1);
});

test('should render the price table headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const priceTable = Selector('div[data-test-id="solution-table"]');
  const priceColumnHeading = priceTable.find('[data-test-id="column-heading-0"]');
  const unitColumnHeading = priceTable.find('[data-test-id="column-heading-1"]');

  await t
    .expect(await extractInnerText(priceColumnHeading)).eql(content.solutionTable.columnInfo[0].data)
    .expect(await extractInnerText(unitColumnHeading)).eql(content.solutionTable.columnInfo[1].data);
});

test('should render the solution table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  await t
    .expect(pageModel.quantityInput.getAttribute('value')).eql(undefined)

    .expect(pageModel.practiceExpandableSection.exists).ok()
    .expect(await extractInnerText(pageModel.practiceExpandableSection))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.title)
    .expect(pageModel.practiceExpandableSection.find('details[open]').exists).notOk()
    .click(pageModel.practiceExpandableSection.find('summary'))
    .expect(pageModel.practiceExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(pageModel.practiceExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.innerComponent.replace('<br><br>', ''));
});

test('should render empty price when 0 returned from the API', async (t) => {
  const mockSelectedPrice = { ...selectedPrice, price: 0 };
  await pageSetup({ ...defaultPageSetup, postRoute: true, mockData: mockSelectedPrice });
  await t.navigateTo(pageUrl);

  const priceInput = Selector('#price');

  await t
    .expect(priceInput.getAttribute('value')).eql(undefined);
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

  await t
    .expect(pageModel.table.exists).ok()
    .expect(pageModel.solutionNameColumnHeading.exists).ok()
    .expect(await extractInnerText(pageModel.solutionNameColumnHeading))
    .eql(content.solutionTable.columnInfo[0].data)
    .expect(pageModel.practiceSizeColumnHeading.exists).ok()
    .expect(await extractInnerText(pageModel.practiceSizeColumnHeading))
    .eql(content.solutionTable.columnInfo[1].data)
    .expect(pageModel.dateColumnHeading.exists).ok()
    .expect(await extractInnerText(pageModel.dateColumnHeading))
    .eql(`${content.solutionTable.columnInfo[2].data}\n${content.solutionTable.columnInfo[2].additionalAdvice}`);
});

test('should render the solution table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const dateArray = deliveryDate.split('-');

  await t
    .expect(pageModel.row.exists).ok()
    .expect(pageModel.solutionName.exists).ok()
    .expect(await extractInnerText(pageModel.solutionName)).eql('Recipient 2 (recipient-2)')

    .expect(pageModel.quantityInput.exists).ok()
    .expect(pageModel.practiceExpandableSection.exists).ok()
    .expect(await extractInnerText(pageModel.practiceExpandableSection))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.title)
    .expect(pageModel.practiceExpandableSection.find('details[open]').exists).notOk()
    .click(pageModel.practiceExpandableSection.find('summary'))
    .expect(pageModel.practiceExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(pageModel.practiceExpandableSection
      .find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.innerComponent.replace('<br><br>', ''))

    .expect(pageModel.dateInput.exists).ok()
    .expect(pageModel.getDayInputAttribute('id')).eql('deliveryDate-day')
    .expect(pageModel.getDayInputAttribute('name')).eql('deliveryDate-day')
    .expect(pageModel.getDayInputAttribute('value')).eql(dateArray[2])

    .expect(pageModel.getMonthInputAttribute('id')).eql('deliveryDate-month')
    .expect(pageModel.getMonthInputAttribute('name')).eql('deliveryDate-month')
    .expect(pageModel.getMonthInputAttribute('value')).eql(dateArray[1])

    .expect(pageModel.getYearInputAttribute('id')).eql('deliveryDate-year')
    .expect(pageModel.getYearInputAttribute('name')).eql('deliveryDate-year')
    .expect(pageModel.getYearInputAttribute('value')).eql(dateArray[0])

    .expect(pageModel.dateExpandableSection.exists).ok()
    .expect(await extractInnerText(pageModel.dateExpandableSection))
    .eql(content.solutionTable.cellInfo.deliveryDate.expandableSection.title)
    .expect(pageModel.dateExpandableSection.find('details[open]').exists).notOk()
    .click(pageModel.dateExpandableSection.find('summary'))
    .expect(pageModel.dateExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(pageModel.dateExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.deliveryDate.expandableSection.innerComponent.replace('<br><br>', ''));
});

test('should render an expandable section for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const expandableSection = Selector('[data-test-id="view-section-input-id-practice"]');

  await t
    .expect(await extractInnerText(expandableSection)).eql(content.solutionTable.cellInfo.quantity.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.innerComponent.replace('<br><br>', ''));
});

// TODO: fix when feature completed
test.skip('should render solution table as errors with error message when no practice list sizes are entered', async (t) => {
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

// TODO: fix when feature completed
test.skip('should render solution table as errors with error message when no date is entered', async (t) => {
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

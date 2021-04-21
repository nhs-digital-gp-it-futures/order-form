import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl } from '../../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';
import AdditionalServicePageModel from '../../additionalServicesPageModel';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/additional-services/neworderitem';

const getLocation = ClientFunction(() => document.location.href);

const selectedPrice = {
  priceId: 1,
  provisioningType: 'OnDemand',
  type: 'Flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.11,
  selectEstimationPeriod: 'month',
};

const itemIdInSession = 'item-1';
const itemNameInSession = 'Item One';
const catalogueSolutionIdInSession = 'solution-1';
const selectedPriceIdInSession = 'price-1';

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
  catalogueSolutionId: catalogueSolutionIdInSession,
  serviceRecipientId: 'B81002',
  serviceRecipientName: 'SomeName',
  selectedRecipients: ['B81002', 'B81074'],
  selectedPrice,
  recipients: [
    {
      name: 'CHP LTD - BRANSHOLME',
      odsCode: 'B81002',
    },
    {
      name: 'CITY HEALTH PRACTICE LTD',
      odsCode: 'B81074',
    },
    {
      name: 'CLIFTON HOUSE MEDICAL CENTRE',
      odsCode: 'B81054',
    },
    {
      name: 'COMMUNITY PAEDIATRICIAN SERVICE (HULL)',
      odsCode: 'Y04461',
    },
  ],
});
const deliveryDate = '2020-10-12';
const selectedQuantity = ['749'];
const selectedRecipients = JSON.stringify(['B81002', 'B81074']);
const recipients = JSON.stringify([
  {
    name: 'CHP LTD - BRANSHOLME',
    odsCode: 'B81002',
  },
  {
    name: 'CITY HEALTH PRACTICE LTD',
    odsCode: 'B81074',
  },
  {
    name: 'CLIFTON HOUSE MEDICAL CENTRE',
    odsCode: 'B81054',
  },
  {
    name: 'COMMUNITY PAEDIATRICIAN SERVICE (HULL)',
    odsCode: 'Y04461',
  },
]);

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
    await setState(ClientFunction)(sessionKeys.plannedDeliveryDate, deliveryDate);
    await setState(ClientFunction)(sessionKeys.recipients, recipients);
    await setState(ClientFunction)(sessionKeys.selectedItemId, itemIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemName, itemNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedCatalogueSolutionId, catalogueSolutionIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedQuantity, JSON.stringify(selectedQuantity));
    await setState(ClientFunction)(sessionKeys.selectedRecipients, selectedRecipients);
    await setState(ClientFunction)(sessionKeys.selectEstimationPeriod, selectedPrice.selectEstimationPeriod);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

fixture('Additional-services - flat ondemand - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render an expandable section for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const expandableSection = Selector('[data-test-id="view-section-input-id-practice"]');

  await t
    .expect(await extractInnerText(expandableSection))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.innerComponent);
});

test('should render the solution table headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const recipientColumnHeading = Selector('[data-test-id="column-heading-0-data"]');
  const quantityColumnHeading = Selector('[data-test-id="column-heading-1-data"]');
  const deliveryDateColumnHeading = Selector('[data-test-id="column-heading-2-data"]');

  await t
    .expect(await extractInnerText(recipientColumnHeading))
    .eql(content.solutionTable.columnInfo[0].data)
    .expect(await extractInnerText(quantityColumnHeading))
    .eql(`${content.solutionTable.columnInfo[1].data} ${selectedPrice.selectEstimationPeriod}`)
    .expect(await extractInnerText(deliveryDateColumnHeading))
    .eql(content.solutionTable.columnInfo[2].data);
});

test('should render the solution table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();
  const solutionName = pageModel.solutionName('CHP LTD - BRANSHOLME-B81002');

  await t
    .expect(pageModel.row.exists).ok()
    .expect(solutionName.exists).ok()
    .expect(await extractInnerText(solutionName)).eql('CHP LTD - BRANSHOLME (B81002)')

    .expect(pageModel.quantityInput.exists).ok()
    .expect(pageModel.practiceExpandableSection.exists).ok()
    .expect(await extractInnerText(pageModel.practiceExpandableSection))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.title)
    .expect(pageModel.practiceExpandableSection.find('details[open]').exists).notOk()
    .click(pageModel.practiceExpandableSection.find('summary'))
    .expect(pageModel.practiceExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(pageModel.practiceExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.innerComponent.replace('<br><br>', ''))

    .expect(pageModel.dateInput.exists).ok()
    .expect(pageModel.dayInput.getAttribute('id')).eql('deliveryDate-day')
    .expect(pageModel.dayInput.getAttribute('name')).eql('deliveryDate-day')
    .expect(pageModel.dayInput.getAttribute('value')).eql('12')

    .expect(pageModel.monthInput.getAttribute('id')).eql('deliveryDate-month')
    .expect(pageModel.monthInput.getAttribute('name')).eql('deliveryDate-month')
    .expect(pageModel.monthInput.getAttribute('value')).eql('10')

    .expect(pageModel.yearInput.getAttribute('id')).eql('deliveryDate-year')
    .expect(pageModel.yearInput.getAttribute('name')).eql('deliveryDate-year')
    .expect(pageModel.yearInput.getAttribute('value')).eql('2020')

    .expect(pageModel.dateExpandableSection.exists).ok()
    .expect(await extractInnerText(pageModel.dateExpandableSection))
    .eql(content.solutionTable.cellInfo.deliveryDate.expandableSection.title)
    .expect(pageModel.dateExpandableSection.find('details[open]').exists).notOk()
    .click(pageModel.dateExpandableSection.find('summary'))
    .expect(pageModel.dateExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(pageModel.dateExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.deliveryDate
      .expandableSection.innerComponent.replace('<br><br>', ''));
});

test('should render 0.00 price when 0 returned from the API', async (t) => {
  const mockSelectedPrice = { ...selectedPrice, price: 0 };
  await pageSetup({ ...defaultPageSetup, postRoute: true, mockData: mockSelectedPrice });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.priceInput.getAttribute('value')).eql('0.00');
});

test('should render select quantity field as errors with error message when no quantity entered causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.solutionTableError.exists).notOk()
    .selectText(pageModel.quantityInput).pressKey('delete')
    .click(pageModel.saveButton);

  await t
    .expect(pageModel.solutionTableError.exists).ok()
    .expect(await extractInnerText(pageModel.solutionTableError)).contains(content.errorMessages.QuantityRequired);
});

test('should render price field as error with error message when no price entered causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();
  const priceFieldWithError = pageModel.priceField.find('[data-test-id="text-field-input-error"]');

  await t
    .expect(priceFieldWithError.exists).notOk()
    .selectText(pageModel.priceField.find('input')).pressKey('delete')
    .click(pageModel.saveButton);

  await t
    .expect(priceFieldWithError.exists).ok()
    .expect(await extractInnerText(pageModel.priceField.find('#price-error')))
    .contains(content.errorMessages.PriceRequired);
});

test('should anchor to the quantity field when clicking on the quantity required error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.errorSummary.exists).notOk()
    .selectText(pageModel.quantityField.find('input')).pressKey('delete')
    .click(pageModel.saveButton);

  await t
    .click(pageModel.errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#quantity`);
});

test('should anchor to the quantity field when clicking on the numerical quantity error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.errorSummary.exists).notOk()
    .typeText(pageModel.quantityField, 'blah', { paste: true })
    .click(pageModel.saveButton);

  await t
    .click(pageModel.errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#quantity`);
});

test('should anchor to the price field when clicking on the price required error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.errorSummary.exists).notOk()
    .selectText(pageModel.priceInput).pressKey('delete')
    .click(pageModel.saveButton);

  await t
    .click(pageModel.errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#price`);
});

test('should anchor to the price field when clicking on the numerical price error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.errorSummary.exists).notOk()
    .typeText(pageModel.priceInput, 'blah', { paste: true })
    .click(pageModel.saveButton);

  await t
    .click(pageModel.errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#price`);
});

test('should anchor to the delivery day field when clicking on the day required error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.errorSummary.exists).notOk()
    .selectText(pageModel.dayInput).pressKey('delete')
    .click(pageModel.saveButton);

  await t
    .expect(await extractInnerText(pageModel.errorSummary.find('a')))
    .contains(content.errorMessages.DeliveryDateDayRequired)
    .click(pageModel.errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#deliveryDate`);
});

test('should anchor to the delivery month field when clicking on the month required error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.errorSummary.exists).notOk()
    .selectText(pageModel.monthInput).pressKey('delete')
    .click(pageModel.saveButton);

  await t
    .expect(await extractInnerText(pageModel.errorSummary.find('a')))
    .contains(content.errorMessages.DeliveryDateMonthRequired)
    .click(pageModel.errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#deliveryDate`);
});

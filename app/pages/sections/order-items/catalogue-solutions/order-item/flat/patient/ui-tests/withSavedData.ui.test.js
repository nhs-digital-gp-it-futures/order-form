import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../../../../../config';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/catalogue-solutions/existing-order-id';

const getLocation = ClientFunction(() => document.location.href);

const orderItem = {
  serviceRecipient: {
    odsCode: 'OX3',
    name: 'Some service recipient 2',
  },
  catalogueItemType: 'Solution',
  catalogueItemName: 'Some catalogue name',
  catalogueItemId: '10000-001',
  deliveryDate: '2020-04-27',
  quantity: 3,
  provisioningType: 'Patient',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'patient',
    description: 'per patient',
  },
  timeUnit: {
    name: 'year',
    description: 'per year',
  },
  price: 0.1,
};

const orderItemPageDataInSession = JSON.stringify({
  solutionId: orderItem.catalogueItemId,
  solutionName: orderItem.catalogueItemName,
  serviceRecipientId: orderItem.serviceRecipient.odsCode,
  serviceRecipientName: orderItem.serviceRecipient.name,
  selectedPrice: {
    price: orderItem.price,
    itemUnit: orderItem.itemUnit,
    timeUnit: orderItem.timeUnit,
    type: orderItem.type,
    provisioningType: orderItem.provisioningType,
  },
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/order-items/existing-order-id')
    .reply(200, orderItem);
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
  if (setup.postRoute) {
    await setState(ClientFunction)('orderItemPageData', orderItemPageDataInSession);
  }
};

fixture('Catalogue-solutions - flat patient - withSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql('Some catalogue name information for Some service recipient 2 (OX3)');
});

test('should link to /order/organisation/order-1/catalogue-solutions for backlink when not a new order item', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-1/catalogue-solutions');
});

test('should populate input fields for day, month and year if data is returned from api', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const inputFields = Selector('#deliveryDate input:not([name=_csrf])');
  const dayInput = inputFields.nth(0);
  const monthInput = inputFields.nth(1);
  const yearInput = inputFields.nth(2);

  await t
    .expect(dayInput.getAttribute('value')).eql('27')
    .expect(monthInput.getAttribute('value')).eql('04')
    .expect(yearInput.getAttribute('value')).eql('2020');
});

test('should populate text field for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const quantity = Selector('[data-test-id="question-quantity"] input');

  await t
    .expect(quantity.getAttribute('value')).eql('3');
});

test('should render the price table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const priceInput = Selector('[data-test-id="question-price"] input');
  const orderUnit = Selector('div[data-test-id="unit-of-order"]');

  await t
    .expect(priceInput.getAttribute('value')).eql('0.10')
    .expect(await extractInnerText(orderUnit)).eql(`${orderItem.itemUnit.description} ${orderItem.timeUnit.description}`);
});

test('should render the delete button as not disabled', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="delete-button"] button');

  await t
    .expect(await extractInnerText(button)).eql('Delete')
    .expect(button.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(button.hasClass('nhsuk-button--disabled')).eql(false);
});

test('should show the correct error summary and input error when date is removed and save is clicked', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(dayInput).pressKey('delete')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete')
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateRequired)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.hasClass('nhsuk-input--error')).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when the quantity is removed and save is clicked', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#quantity-error span');
  const quantity = Selector('[data-test-id="question-quantity"] input');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(quantity.hasClass('nhsuk-input--error')).notOk()
    .selectText(quantity).pressKey('delete')
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.QuantityRequired)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(quantity.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when the price is removed and save is clicked', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#price-error span');
  const price = Selector('[data-test-id="question-price"] input');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(price.hasClass('nhsuk-input--error')).notOk()
    .selectText(price).pressKey('delete')
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.PriceRequired)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(price.hasClass('nhsuk-input--error')).ok();
});

test('should navigate to catalogue solution dashboard page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-1/order-items/existing-order-id', { deliveryDate: '2020-04-27', quantity: 310, price: 0.1 })
    .reply(200, {});

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '10', { paste: true })
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/catalogue-solutions');
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-1/order-items/existing-order-id', { deliveryDate: '2020-04-27', quantity: 3, price: 0.1 })
    .reply(400, {
      errors: [{
        field: 'DeliveryDate',
        id: 'DeliveryDateOutsideDeliveryWindow',
      }],
    });

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error');
  const deliveryDateInputs = Selector('[data-test-id="question-deliveryDate"] input');
  const dayInput = deliveryDateInputs.nth(0);
  const monthInput = deliveryDateInputs.nth(1);
  const yearInput = deliveryDateInputs.nth(2);
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateOutsideDeliveryWindow)

    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).contains(content.errorMessages.DeliveryDateOutsideDeliveryWindow)

    .expect(dayInput.getAttribute('value')).eql('27')
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('04')
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

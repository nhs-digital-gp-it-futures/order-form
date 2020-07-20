import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../../../../../config';
import content from '../manifest.json';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/existing-order-id';

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
  estimationPeriod: 'month',
  provisioningType: 'OnDemand',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.1,
};

const authTokenInSession = JSON.stringify({
  id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
});
const orderItemPageDataInSession = JSON.stringify({
  solutionId: orderItem.catalogueItemId,
  solutionName: orderItem.catalogueItemName,
  serviceRecipientId: orderItem.serviceRecipient.odsCode,
  serviceRecipientName: orderItem.serviceRecipient.name,
  selectedPrice: {
    price: orderItem.price,
    itemUnit: orderItem.itemUnit,
    type: orderItem.type,
    provisioningType: orderItem.provisioningType,
  },
});

const setState = ClientFunction((key, value) => {
  document.cookie = `${key}=${value}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/order-items/existing-order-id')
    .reply(200, orderItem);
};

const pageSetup = async (withAuth = true, postRoute = false) => {
  if (withAuth) {
    mocks();
    await setState('fakeToken', authTokenInSession);
    await setState('orderItemPageData', orderItemPageDataInSession);
    if (postRoute) {
      await setState('orderItemPageData', orderItemPageDataInSession);
    }
  }
};

fixture('Catalogue-solutions - flat ondemand - withSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql('Some catalogue name information for Some service recipient 2 (OX3)');
});

test('should navigate to /organisation/order-id/catalogue-solutions/select/solution/price/recipient when click on backlink when not a new order item', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions');
});

test('should populate input fields for day, month and year if data is returned from api', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const inputFields = Selector('#deliveryDate input:not([name=_csrf])');
  const dayInput = inputFields.nth(0);
  const monthInput = inputFields.nth(1);
  const yearInput = inputFields.nth(2);

  await t
    .expect(dayInput.exists).ok()
    .expect(dayInput.getAttribute('value')).eql('27')
    .expect(monthInput.exists).ok()
    .expect(monthInput.getAttribute('value')).eql('04')
    .expect(yearInput.exists).ok()
    .expect(yearInput.getAttribute('value')).eql('2020');
});

test('should populate text field for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const quantity = Selector('[data-test-id="question-quantity"] input');

  await t
    .expect(quantity.exists).ok()
    .expect(quantity.getAttribute('value')).eql('3');
});

test('should populate the selectEstimationPeriod question radio button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectEstimationPeriodRadioOptions = Selector('[data-test-id="question-selectEstimationPeriod"] input').nth(0);

  await t
    .expect(selectEstimationPeriodRadioOptions.exists).ok()
    .expect(selectEstimationPeriodRadioOptions.hasAttribute('checked')).ok();
});

test('should render the price table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const priceInput = Selector('[data-test-id="question-price"] input');
  const orderUnit = Selector('div[data-test-id="unit-of-order"]');

  await t
    .expect(priceInput.exists).ok()
    .expect(priceInput.getAttribute('value')).eql('0.10')
    .expect(orderUnit.exists).ok()
    .expect(await extractInnerText(orderUnit)).eql(orderItem.itemUnit.description);
});

test('should render the delete button as not disabled', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="delete-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql('Delete')
    .expect(button.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(button.hasClass('nhsuk-button--disabled')).eql(false);
});

test('should show the correct error summary and input error when date is removed and save is clicked', async (t) => {
  await pageSetup(true, true);
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
  await pageSetup(true, true);
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
  await pageSetup(true, true);
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
    .put('/api/v1/orders/order-id/sections/catalogue-solutions/existing-order-id')
    .reply(200, {});

  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '10', { paste: true })
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions');
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/catalogue-solutions/existing-order-id')
    .reply(400, {
      errors: [{
        field: 'DeliveryDate',
        id: 'DeliveryDateOutsideDeliveryWindow',
      }],
    });

  await pageSetup(true, true);
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

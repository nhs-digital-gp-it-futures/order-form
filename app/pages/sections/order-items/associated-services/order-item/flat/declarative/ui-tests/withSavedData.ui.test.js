import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl, organisationApiUrl, solutionsApiUrl } from '../../../../../../../../config';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';
import mockOrgData from '../../../../../../../../test-utils/mockData/mockOrganisationData.json';

const organisation = 'organisation';
const callOffId = 'order-1';
const catalogueItemId = '10000-001';
const odsCode = 'odsCode';

const pageUrl = `http://localhost:1234/order/${organisation}/${odsCode}/order/${callOffId}/associated-services/${catalogueItemId}`;
const selectedPriceId = '1';

const getLocation = ClientFunction(() => document.location.href);

const selectedPrice = {
  priceId: '1',
  provisioningType: 'Declarative',
  type: 'Flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'course',
    description: 'per course',
    tierName: 'courses',
  },
  price: 0.1,
};

const catalogueItem = {
  catalogueItemType: 'AssociatedService',
  catalogueItemName: 'Some item name',
};

const orderItem = {
  ...catalogueItem,
  ...selectedPrice,
};

const baseServiceRecipient = { name: 'org-name', odsCode: 'odsCode' };
const validServiceRecipient = { ...baseServiceRecipient, quantity: 10 };

const validRequestBody = {
  ...orderItem,
  serviceRecipients: [validServiceRecipient],
};

const orderItemPageDataInSession = JSON.stringify({
  itemId: catalogueItemId,
  itemName: orderItem.catalogueItemName,
  selectedPrice,
});
const associatedServicePricesInSesion = JSON.stringify({
  prices: [{ priceId: 1 }, { priceId: 2 }],
});

const mocks = () => {
  nock(orderApiUrl)
    .get(`/api/v1/orders/${callOffId}/order-items/${catalogueItemId}`)
    .reply(200, { ...orderItem, serviceRecipients: [validServiceRecipient] });
  nock(solutionsApiUrl)
    .get(`/api/v1/prices/${selectedPriceId}`)
    .reply(200, selectedPrice);
  nock(organisationApiUrl)
    .get('/api/v1/ods/odsCode')
    .reply(200, mockOrgData);
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
    await setState(ClientFunction)(sessionKeys.associatedServicePrices, associatedServicePricesInSesion);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
    await setState(ClientFunction)(sessionKeys.associatedServicePrices, associatedServicePricesInSesion);
  }
};

fixture('Associated-services - flat declarative - withSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Some item name information for order-1');
});

test(`should link to /order/${organisation}/${odsCode}/order/${callOffId}/associated-services for backlink`, async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql(`/order/${organisation}/${odsCode}/order/${callOffId}/associated-services`);
});

test('should populate text field for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const quantity = Selector('[data-test-id="question-quantity"] input');

  await t
    .expect(quantity.getAttribute('value')).eql('10');
});

test('should render the price table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const priceInput = Selector('[data-test-id="question-price"] input');
  const orderUnit = Selector('div[data-test-id="unit-of-order"]');

  await t
    .expect(priceInput.getAttribute('value')).eql('0.10')
    .expect(await extractInnerText(orderUnit)).eql(orderItem.itemUnit.description);
});

test('should render the delete button as not disabled', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="delete-button"] a');

  await t
    .expect(await extractInnerText(button)).eql('Delete')
    .expect(button.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(button.hasClass('nhsuk-button--disabled')).eql(false);
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
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.PriceRequired)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(price.hasClass('nhsuk-input--error')).ok();
});

test('should navigate to associated services dashboard page if save button is clicked and data is valid', async (t) => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id')
    .reply(200, baseServiceRecipient);

  nock(orderApiUrl)
    .put(`/api/v1/orders/${callOffId}/order-items/${catalogueItemId}`, validRequestBody)
    .reply(200, {});

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '10', { replace: true })
    .click(saveButton)
    .expect(getLocation()).eql(`http://localhost:1234/order/organisation/${odsCode}/order/${callOffId}/associated-services`);
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const errorSummary = Selector('[data-test-id="error-summary"]');
  const quantityInput = Selector('[data-test-id="question-quantity"] input');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '-8', { replace: true })
    .click(saveButton);

  await t
    .expect(await extractInnerText(errorSummary)).contains(content.errorMessages.QuantityGreaterThanZero);
});

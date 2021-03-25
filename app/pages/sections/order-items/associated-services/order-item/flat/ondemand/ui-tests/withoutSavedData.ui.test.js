import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl, organisationApiUrl } from '../../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';

const organisation = 'organisation';
const callOffId = 'order-1';
const pageUrl = `http://localhost:1234/order/${organisation}/${callOffId}/associated-services/neworderitem`;

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
  price: 0.1,
  estimationPeriod: 'month',
};

const itemIdInSession = 'item-1';
const itemNameInSession = 'Item One';
const selectedPriceIdInSession = 'price-1';

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
  selectedPrice,
});

const baseServiceRecipient = { name: 'recipient-name', odsCode: 'recipient-1' };
const validServiceRecipient = { ...baseServiceRecipient, quantity: 10 };
const invalidServiceRecipient = { ...baseServiceRecipient, quantity: 0 };

const baseRequestBody = {
  ...selectedPrice,
  catalogueItemName: 'Item One',
  catalogueItemType: 'AssociatedService',
};

const validRequestBody = {
  ...baseRequestBody,
  serviceRecipients: [validServiceRecipient],
};

const invalidRequestBody = {
  ...baseRequestBody,
  serviceRecipients: [invalidServiceRecipient],
};

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);

  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id')
    .reply(200, baseServiceRecipient);
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: true };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
    await setState(ClientFunction)('fakeToken', authTokenInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemId, itemIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemName, itemNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

fixture('Associated-services - flat ondemand - withoutSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should navigate to associated-services dashboard page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put(`/api/v1/orders/${callOffId}/order-items/${itemIdInSession}`, validRequestBody)
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const estimatiodPeriodInputs = Selector('[data-test-id="question-selectEstimationPeriod"] input');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '10', { paste: true })
    .click(estimatiodPeriodInputs.nth(0))
    .click(saveButton)
    .expect(getLocation()).eql(`http://localhost:1234/order/${organisation}/${callOffId}/associated-services`);
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .put(`/api/v1/orders/${callOffId}/order-items/${itemIdInSession}`, invalidRequestBody)
    .reply(400, {
      errors: {
        'ServiceRecipients[0].Quantity': ['QuantityGreaterThanZero'],
      },
    });

  await pageSetup();
  await t.navigateTo(pageUrl);

  const errorSummary = Selector('[data-test-id="error-summary"]');
  // const errorMessage = Selector('#quantity-error');
  const quantityInput = Selector('[data-test-id="question-quantity"] input');
  const estimatiodPeriodInputs = Selector('[data-test-id="question-selectEstimationPeriod"] input');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '0', { paste: true })
    .click(estimatiodPeriodInputs.nth(0))
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.QuantityGreaterThanZero)

  // Currently broken, TODO: fix
  // .expect(await extractInnerText(errorMessage)).contains(content.errorMessages.QuantityGreaterThanZero)

    .expect(quantityInput.getAttribute('value')).eql('0');
  // .expect(quantityInput.hasClass('nhsuk-input--error')).ok();
});

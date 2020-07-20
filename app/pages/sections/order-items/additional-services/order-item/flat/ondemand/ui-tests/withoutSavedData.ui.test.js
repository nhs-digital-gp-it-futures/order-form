import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../../../../../config';
import { nockCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';

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
  price: 0.1,
};

const itemIdInSession = 'item-1';
const itemNameInSession = 'Item One';
const selectedRecipientIdInSession = 'recipient-1';
const selectedRecipientNameInSession = 'recipient-name';
const selectedPriceIdInSession = 'price-1';

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
  serviceRecipientId: selectedRecipientIdInSession,
  serviceRecipientName: selectedRecipientNameInSession,
  selectedPrice,
});

const requestPostBody = {
  priceId: 1,
  provisioningType: 'OnDemand',
  type: 'Flat',
  currencyCode: 'GBP',
  itemUnit: { name: 'consultation', description: 'per consultation' },
  price: 0.1,
  serviceRecipient: { name: 'recipient-name', odsCode: 'recipient-1' },
  catalogueItemId: 'item-1',
  catalogueItemName: 'Item One',
  catalogueItemType: 'AdditionalService',
  quantity: 10,
  estimationPeriod: 'month',
};


const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const pageSetup = async (withAuth = true, postRoute = false) => {
  if (withAuth) {
    mocks();
    await setState(ClientFunction)('fakeToken', authTokenInSession);
    await setState(ClientFunction)('selectedRecipientId', selectedRecipientIdInSession);
    await setState(ClientFunction)('selectedRecipientName', selectedRecipientNameInSession);
    await setState(ClientFunction)('selectedItemId', itemIdInSession);
    await setState(ClientFunction)('selectedItemName', itemNameInSession);
    await setState(ClientFunction)('selectedPriceId', selectedPriceIdInSession);
    if (postRoute) {
      await setState(ClientFunction)('orderItemPageData', orderItemPageDataInSession);
    }
  }
};

fixture('Additional-services - flat ondemand - withoutSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockCheck(nock, t);
  });

test('should navigate to additional-services dashboard page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-1/order-items', { ...requestPostBody, quantity: 10 })
    .reply(200, {});

  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const estimatiodPeriodInputs = Selector('[data-test-id="question-selectEstimationPeriod"] input');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '10', { paste: true })
    .click(estimatiodPeriodInputs.nth(0))
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/additional-services');
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-1/order-items', { ...requestPostBody, quantity: 0 })
    .reply(400, {
      errors: [{
        field: 'Quantity',
        id: 'QuantityGreaterThanZero',
      }],
    });

  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#quantity-error');
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

    .expect(await extractInnerText(errorMessage)).contains(content.errorMessages.QuantityGreaterThanZero)

    .expect(quantityInput.getAttribute('value')).eql('0')
    .expect(quantityInput.hasClass('nhsuk-input--error')).ok();
});

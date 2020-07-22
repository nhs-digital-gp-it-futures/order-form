import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../../../../../config';
import { nockAndErrorCheck } from '../../../../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/associated-services/neworderitem';

const getLocation = ClientFunction(() => document.location.href);

const selectedPrice = {
  priceId: 1,
  provisioningType: 'Declarative',
  type: 'Flat',
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
const itemIdInSession = 'item-1';
const itemNameInSession = 'Item One';
const selectedPriceIdInSession = 'price-1';

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
  selectedPrice,
});

const setState = ClientFunction((key, value) => {
  document.cookie = `${key}=${value}`;
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const pageSetup = async (withAuth = true, postRoute = false) => {
  if (withAuth) {
    mocks();
    await setState('fakeToken', authTokenInSession);
    await setState('selectedItemId', itemIdInSession);
    await setState('selectedItemName', itemNameInSession);
    await setState('selectedPriceId', selectedPriceIdInSession);
    if (postRoute) {
      await setState('orderItemPageData', orderItemPageDataInSession);
    }
  }
};

fixture('Associated-services - flat declarative - withoutSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should navigate to associated-services dashboard page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-1/order-items')
    .reply(200, {});

  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '10', { paste: true })
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/associated-services');
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-1/order-items')
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
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '0', { paste: true })
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.QuantityGreaterThanZero)

    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).contains(content.errorMessages.QuantityGreaterThanZero)

    .expect(quantityInput.getAttribute('value')).eql('0')
    .expect(quantityInput.hasClass('nhsuk-input--error')).ok();
});

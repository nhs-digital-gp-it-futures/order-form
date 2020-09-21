import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/neworderitem';

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

const itemIdInSession = 'solution-1';
const itemNameInSession = 'solution-name';
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
  ...selectedPrice,
  serviceRecipient: { name: 'recipient-name', odsCode: 'recipient-1' },
  catalogueItemId: 'solution-1',
  catalogueItemName: 'solution-name',
  catalogueItemType: 'Solution',
};

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: true };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
    await setState(ClientFunction)('fakeToken', authTokenInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientId, selectedRecipientIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientName, selectedRecipientNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemId, itemIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemName, itemNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

fixture('Catalogue-solutions - flat ondemand - withoutSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should navigate to catalogue solution dashboard page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-id/order-items',
      {
        ...requestPostBody, deliveryDate: '2020-01-01', quantity: 10, estimationPeriod: 'month',
      })
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const deliveryDateInputs = Selector('[data-test-id="question-deliveryDate"] input');
  const dayInput = deliveryDateInputs.nth(0);
  const monthInput = deliveryDateInputs.nth(1);
  const yearInput = deliveryDateInputs.nth(2);
  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const estimatiodPeriodInputs = Selector('[data-test-id="question-selectEstimationPeriod"] input');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(dayInput, '01', { paste: true })
    .typeText(monthInput, '01', { paste: true })
    .typeText(yearInput, '2020', { paste: true })
    .typeText(quantityInput, '10', { paste: true })
    .click(estimatiodPeriodInputs.nth(0))
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions');
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-id/order-items',
      {
        ...requestPostBody, deliveryDate: '2020-01-01', quantity: 10, estimationPeriod: 'month',
      })
    .reply(400, {
      errors: [{
        field: 'DeliveryDate',
        id: 'DeliveryDateOutsideDeliveryWindow',
      }],
    });

  await pageSetup();
  await t.navigateTo(pageUrl);

  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error');
  const deliveryDateInputs = Selector('[data-test-id="question-deliveryDate"] input');
  const dayInput = deliveryDateInputs.nth(0);
  const monthInput = deliveryDateInputs.nth(1);
  const yearInput = deliveryDateInputs.nth(2);
  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const estimatiodPeriodInputs = Selector('[data-test-id="question-selectEstimationPeriod"] input');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(dayInput, '01', { paste: true })
    .typeText(monthInput, '01', { paste: true })
    .typeText(yearInput, '2020', { paste: true })
    .typeText(quantityInput, '10', { paste: true })
    .click(estimatiodPeriodInputs.nth(0))
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateOutsideDeliveryWindow)

    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).contains(content.errorMessages.DeliveryDateOutsideDeliveryWindow)

    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('01')
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

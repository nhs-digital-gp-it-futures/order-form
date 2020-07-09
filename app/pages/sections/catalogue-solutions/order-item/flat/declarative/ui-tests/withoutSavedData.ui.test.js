import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/newsolution';

const getLocation = ClientFunction(() => document.location.href);

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const selectedSolutionIdState = ClientFunction(() => {
  const cookieValue = 'solution-1';

  document.cookie = `selectedSolutionId=${cookieValue}`;
});

const solutionNameState = ClientFunction(() => {
  const cookieValue = 'solution-name';

  document.cookie = `solutionName=${cookieValue}`;
});

const selectedRecipientIdState = ClientFunction(() => {
  const cookieValue = 'recipient-1';

  document.cookie = `selectedRecipientId=${cookieValue}`;
});

const serviceRecipientNameState = ClientFunction(() => {
  const cookieValue = 'recipient-name';

  document.cookie = `selectedRecipientName=${cookieValue}`;
});

const selectedPriceIdState = ClientFunction(() => {
  const cookieValue = 'price-1';

  document.cookie = `selectedPriceId=${cookieValue}`;
});

const selectedPrice = {
  priceId: 1,
  provisioningType: 'Declarative',
  type: 'Flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'license',
    description: 'per license',
  },
  timeUnit: {
    name: 'month',
    description: 'per month',
  },
  price: 0.1,
};

const selectedPriceState = ClientFunction((selectedPriceValue) => {
  const cookieValue = JSON.stringify(selectedPriceValue);

  document.cookie = `selectedPrice=${cookieValue}`;
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/solutions/solution-1')
    .reply(200, { id: 'solution-1', name: 'Solution One' });
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const pageSetup = async (withAuth = true, postRoute = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
    await selectedRecipientIdState();
    await selectedSolutionIdState();
    await selectedPriceIdState();
    await serviceRecipientNameState();
    if (postRoute) {
      await solutionNameState();
      await selectedPriceState(selectedPrice);
    }
  }
};

fixture('Catalogue-solutions - flat declarative - withoutSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should navigate to catalogue solution dashboard page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-id/sections/catalogue-solutions')
    .reply(200, {});

  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const deliveryDateInputs = Selector('[data-test-id="question-deliveryDate"] input');
  const dayInput = deliveryDateInputs.nth(0);
  const monthInput = deliveryDateInputs.nth(1);
  const yearInput = deliveryDateInputs.nth(2);
  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(dayInput, '01', { paste: true })
    .typeText(monthInput, '01', { paste: true })
    .typeText(yearInput, '2020', { paste: true })
    .typeText(quantityInput, '10', { paste: true })
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions');
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-id/sections/catalogue-solutions')
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
  const quantityInput = Selector('[data-test-id="question-quantity"]');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(dayInput, '01', { paste: true })
    .typeText(monthInput, '01', { paste: true })
    .typeText(yearInput, '2020', { paste: true })
    .typeText(quantityInput, '10', { paste: true })
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

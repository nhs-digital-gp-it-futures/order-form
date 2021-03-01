import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/select/solution/price/recipients/date';

const catalogueId = 'catalogue-id';
const itemName = 'One Solution';
const priceId = 1;
const mockPrices = [{
  priceId: 1,
  type: 'flat',
  provisioningType: 'patient',
  price: 99.99,
}];
const putPlannedDeliveryDateErrorResponse = {
  errors: [{
    field: 'DeliveryDate',
    id: 'DeliveryDateOutsideDeliveryWindow',
  }],
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/commencement-date')
    .reply(200, { commencementDate: '2020-10-10' });
};

const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    await setState(ClientFunction)(sessionKeys.selectedItemName, itemName);
    mocks();
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.selectedItemId, catalogueId);
    await setState(ClientFunction)(sessionKeys.selectedPriceId, priceId);
    await setState(ClientFunction)(sessionKeys.solutionPrices, JSON.stringify({ prices: mockPrices }));
    await setState(ClientFunction)(sessionKeys.selectedPrice, JSON.stringify(mockPrices[0]));
    await setState(ClientFunction)(sessionKeys.selectedQuantity, '20');
    await setState(ClientFunction)(sessionKeys.selectEstimationPeriod, 'month');
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions - Planned delivery date page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ withAuth: false, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render planned-delivery-date page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="planned-delivery-date-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-id/catalogue-solutions/select/solution/price/recipients for backLink', async (t) => {
  await setState(ClientFunction)('solutionPrices', JSON.stringify({ prices: [{}] }));
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id/catalogue-solutions/select/solution/price/recipients');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="planned-delivery-date-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`Planned delivery date of ${itemName} for order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="planned-delivery-date-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render legend with mainAdvice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const mainAdvice = Selector('legend');

  await t
    .expect(await extractInnerText(mainAdvice)).eql(content.questions.deliveryDate.mainAdvice);
});

test('should render additionalAdvice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const additionalAdvice = Selector('[data-test-id="date-field-input"] span.nhsuk-hint');

  await t
    .expect(await extractInnerText(additionalAdvice)).eql(content.questions.deliveryDate.additionalAdvice);
});

test('should render labels for day, month and year inputs', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const labels = Selector('label');
  const dayLabel = labels.nth(0);
  const monthLabel = labels.nth(1);
  const yearLabel = labels.nth(2);

  await t
    .expect(await extractInnerText(dayLabel)).eql('Day')
    .expect(await extractInnerText(monthLabel)).eql('Month')
    .expect(await extractInnerText(yearLabel)).eql('Year');
});

test('should render input fields for day, month and year', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const inputFields = Selector('#deliveryDate input:not([name=_csrf])');
  const dayInput = inputFields.nth(0);
  const monthInput = inputFields.nth(1);
  const yearInput = inputFields.nth(2);

  await t
    .expect(dayInput.getAttribute('id')).eql('deliveryDate-day')
    .expect(dayInput.getAttribute('name')).eql('deliveryDate-day')
    .expect(dayInput.getAttribute('type')).eql('number')

    .expect(monthInput.getAttribute('id')).eql('deliveryDate-month')
    .expect(monthInput.getAttribute('name')).eql('deliveryDate-month')
    .expect(monthInput.getAttribute('type')).eql('number')

    .expect(yearInput.getAttribute('id')).eql('deliveryDate-year')
    .expect(yearInput.getAttribute('name')).eql('deliveryDate-year')
    .expect(yearInput.getAttribute('type')).eql('number');
});

test('should render the "Continue" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should navigate to task list page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put(`/api/v1/orders/order-id/default-delivery-date/${catalogueId}/${priceId}/`, { deliveryDate: '2020-10-10' })
    .reply(200, { success: true });

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');

  await t
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions/neworderitem');
});

// FE Validation tests
test('should show the correct error summary and input error when no date is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .selectText(dayInput).pressKey('delete')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Enter a planned delivery date')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.hasClass('nhsuk-input--error')).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when no day is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .selectText(dayInput).pressKey('delete')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Planned delivery date must include a day')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('10')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when no month is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Planned delivery date must include a month')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('10')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when no year is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Planned delivery date must include a year')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('10')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('10')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when a year > 4 chars is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete').typeText(yearInput, '202020', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Year must be four numbers')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('10')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('10')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('202020')
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when a year < 4 chars is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete').typeText(yearInput, '20', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Year must be four numbers')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('10')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('10')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('20')
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when a day > 31 is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .selectText(dayInput).pressKey('delete').typeText(dayInput, '32', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Planned delivery date must be a real date')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('32')
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('10')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when a month > 12 is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete').typeText(monthInput, '13', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Planned delivery date must be a real date')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('10')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('13')
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when a year < 1000 is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete').typeText(yearInput, '0999', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Planned delivery date must be a real date')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('10')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('10')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('0999')
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when incorrect day/month combo is entered and save is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .selectText(dayInput).pressKey('delete').typeText(dayInput, '31', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete').typeText(monthInput, '02', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Planned delivery date must be a real date')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('31')
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

// BE Validation tests
test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .put(`/api/v1/orders/order-id/default-delivery-date/${catalogueId}/${priceId}/`, { deliveryDate: '2000-01-01' })
    .reply(400, putPlannedDeliveryDateErrorResponse);

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .selectText(dayInput).pressKey('delete').typeText(dayInput, '01', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete').typeText(monthInput, '01', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete').typeText(yearInput, '2000', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Planned delivery date must be within 42 months from the commencement date for this Call-off Agreement')
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('01')
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2000')
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  nock(orderApiUrl)
    .put(`/api/v1/orders/order-id/default-delivery-date/${catalogueId}/${priceId}/`, { deliveryDate: '2000-01-01' })
    .reply(400, putPlannedDeliveryDateErrorResponse);

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#deliveryDate-error span');
  const dayInput = Selector('#deliveryDate-day');
  const monthInput = Selector('#deliveryDate-month');
  const yearInput = Selector('#deliveryDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .selectText(dayInput).pressKey('delete').typeText(dayInput, '01', { paste: true })
    .selectText(monthInput).pressKey('delete').typeText(monthInput, '01', { paste: true })
    .selectText(yearInput).pressKey('delete').typeText(yearInput, '2000', { paste: true })
    .click(saveButton);

  await t
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#deliveryDate`);
});

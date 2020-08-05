import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import commonContent from '../commonManifest.json';
import content from '../flat/ondemand/manifest.json';
import { solutionsApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/neworderitem';

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
const itemNameInSession = 'Solution One';
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

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };
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

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions - common - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ ...defaultPageSetup, withAuth: false, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render Catalogue-solutions order-item page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="order-item-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-id/catalogue-solutions/select/solution/recipient for backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id/catalogue-solutions/select/solution/price/recipient');
});

test('should link to /order/organisation/order-id/catalogue-solutions/select/solution/price/recipient for backlink after validation errors', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .click(saveButton)
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id/catalogue-solutions/select/solution/price/recipient');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Solution One information for recipient-name (recipient-1)');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-item-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(commonContent.description);
});

test('should render legend with mainAdvice for delivery date question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const mainAdvice = Selector('legend');

  await t
    .expect(await extractInnerText(mainAdvice)).eql(content.questions.deliveryDate.mainAdvice);
});

test('should render additionalAdvice for delivery date question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const additionalAdvice = Selector('[data-test-id="date-field-input"] span.nhsuk-hint');

  await t
    .expect(await extractInnerText(additionalAdvice)).eql(content.questions.deliveryDate.additionalAdvice);
});

test('should render labels for day, month and year inputs for delivery date question', async (t) => {
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

test('should render input fields for day, month and year for delivery date question', async (t) => {
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

test('should render the delete button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="delete-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(commonContent.deleteButton.text)
    .expect(button.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(button.hasClass('nhsuk-button--disabled')).eql(true);
});

test('delete button should still be disabled after validation errors', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const deleteButton = Selector('[data-test-id="delete-button"] button');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .click(saveButton)
    .expect(deleteButton.exists).ok()
    .expect(await extractInnerText(deleteButton)).eql(commonContent.deleteButton.text)
    .expect(deleteButton.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(deleteButton.hasClass('nhsuk-button--disabled')).eql(true);
});

test('should render the save button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(commonContent.saveButtonText);
});

test('should show the correct error summary and input error when no date is entered and save is clicked', async (t) => {
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
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateRequired)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.hasClass('nhsuk-input--error')).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when no day is entered and save is clicked', async (t) => {
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
    .typeText(monthInput, '02', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(yearInput, '2020', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateDayRequired)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when no month is entered and save is clicked', async (t) => {
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
    .typeText(dayInput, '02', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(yearInput, '2020', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateMonthRequired)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when no year is entered and save is clicked', async (t) => {
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
    .typeText(dayInput, '02', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(monthInput, '02', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateYearRequired)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when a year > 4 chars is entered and save is clicked', async (t) => {
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
    .typeText(dayInput, '02', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(monthInput, '02', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(yearInput, '202020', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateYearLength)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('202020')
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when a year < 4 chars is entered and save is clicked', async (t) => {
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
    .typeText(dayInput, '02', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(monthInput, '02', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(yearInput, '20', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateYearLength)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('20')
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when a day > 31 is entered and save is clicked', async (t) => {
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
    .typeText(dayInput, '32', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(monthInput, '02', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(yearInput, '2020', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateNotReal)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('32')
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when a month > 12 is entered and save is clicked', async (t) => {
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
    .typeText(dayInput, '02', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(monthInput, '13', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(yearInput, '2020', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateNotReal)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('13')
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when a year < 1000 is entered and save is clicked', async (t) => {
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
    .typeText(dayInput, '02', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(monthInput, '02', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(yearInput, '0999', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateNotReal)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('0999')
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when incorrect day/month combo is entered and save is clicked', async (t) => {
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
    .typeText(dayInput, '31', { paste: true })
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(monthInput, '02', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .typeText(yearInput, '2020', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(3)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.DeliveryDateNotReal)
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('31')
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

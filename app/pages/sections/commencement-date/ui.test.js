import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from './manifest.json';
import { orderApiUrl } from '../../../config';

const pageUrl = 'http://localhost:1234/organisation/order-id/commencement-date';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});


const mocks = (mockData) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/commencement-date')
    .reply(200, mockData);
};

const pageSetup = async (t, withAuth = false, mockData = {}) => {
  if (withAuth) {
    mocks(mockData);
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

const putCommencementDateErrorResponse = {
  errors: [{
    field: 'CommencementDate',
    id: 'CommencementDateGreaterThan',
  }],
};

fixture('commencement-date page')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      // eslint-disable-next-line no-console
      console.log(`pending mocks: ${nock.pendingMocks()}`);
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  await pageSetup(t);
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render commencement-date page', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="commencement-date-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id when click on backLink', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

test('should render the title', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="commencement-date-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql('Commencement date for order-id');
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="commencement-date-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render legend with mainAdvice', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const mainAdvice = Selector('legend');

  await t
    .expect(mainAdvice.exists).ok()
    .expect(await extractInnerText(mainAdvice)).eql(content.questions[0].mainAdvice);
});

test('should render additionalAdvice', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const additionalAdvice = Selector('[data-test-id="date-field-input"] span.nhsuk-hint');

  await t
    .expect(additionalAdvice.exists).ok()
    .expect(await extractInnerText(additionalAdvice)).eql(content.questions[0].additionalAdvice);
});

test('should render labels for day, month and year inputs', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const labels = Selector('label');
  const dayLabel = labels.nth(0);
  const monthLabel = labels.nth(1);
  const yearLabel = labels.nth(2);

  await t
    .expect(dayLabel.exists).ok()
    .expect(await extractInnerText(dayLabel)).eql('Day')
    .expect(monthLabel.exists).ok()
    .expect(await extractInnerText(monthLabel)).eql('Month')
    .expect(yearLabel.exists).ok()
    .expect(await extractInnerText(yearLabel)).eql('Year');
});

test('should render input fields for day, month and year', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const inputFields = Selector('#commencementDate input:not([name=_csrf])');
  const dayInput = inputFields.nth(0);
  const monthInput = inputFields.nth(1);
  const yearInput = inputFields.nth(2);

  await t
    .expect(dayInput.exists).ok()
    .expect(dayInput.getAttribute('id')).eql('commencementDate-day')
    .expect(dayInput.getAttribute('name')).eql('commencementDate-day')
    .expect(dayInput.getAttribute('type')).eql('number')
    .expect(monthInput.exists).ok()
    .expect(monthInput.getAttribute('id')).eql('commencementDate-month')
    .expect(monthInput.getAttribute('name')).eql('commencementDate-month')
    .expect(monthInput.getAttribute('type')).eql('number')
    .expect(yearInput.exists).ok()
    .expect(yearInput.getAttribute('id')).eql('commencementDate-year')
    .expect(yearInput.getAttribute('name')).eql('commencementDate-year')
    .expect(yearInput.getAttribute('type')).eql('number');
});

test('should populate input fields for day, month and year if data is returned from api', async (t) => {
  await pageSetup(t, true, { commencementDate: '2020-02-01T00:00:00' });
  await t.navigateTo(pageUrl);

  const inputFields = Selector('#commencementDate input:not([name=_csrf])');
  const dayInput = inputFields.nth(0);
  const monthInput = inputFields.nth(1);
  const yearInput = inputFields.nth(2);

  await t
    .expect(dayInput.exists).ok()
    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(monthInput.exists).ok()
    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(yearInput.exists).ok()
    .expect(yearInput.getAttribute('value')).eql('2020');
});

test('should render save button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});

// FE Validation tests
test('should navigate to task list page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/commencement-date')
    .reply(200, {});

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const inputFields = Selector('#commencementDate input:not([name=_csrf])');
  const dayInput = inputFields.nth(0);
  const monthInput = inputFields.nth(1);
  const yearInput = inputFields.nth(2);

  await t
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '01')
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '01')
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '2020')
    .expect(saveButton.exists).ok()
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

test('should show the correct error summary and input error when no date is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Enter a commencement date')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when no day is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must include a day')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when no month is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must include a month')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when no year is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must include a year')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when a year > 4 chars is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '202020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Year must be four numbers')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when a year < 4 chars is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '20')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Year must be four numbers')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when a day > 31 is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '32')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be a real date')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when a month > 12 is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '13')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be a real date')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when a year < 1000 is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '02')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '0999')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be a real date')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when incorrect day/month combo is entered and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '31')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be a real date')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

// BE Validation tests
test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/commencement-date')
    .reply(400, putCommencementDateErrorResponse);

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '01')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '01')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '2000')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be in the future or within the last 60 days')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(dayInput.exists).ok()
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()
    .expect(monthInput.exists).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()
    .expect(yearInput.exists).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/commencement-date')
    .reply(400, putCommencementDateErrorResponse);

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorSummary.exists).notOk()
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.exists).ok()
    .typeText(dayInput, '01')
    .expect(monthInput.exists).ok()
    .typeText(monthInput, '01')
    .expect(yearInput.exists).ok()
    .typeText(yearInput, '2000')
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#commencementDate`);
});

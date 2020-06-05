import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/commencement-date';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/commencement-date')
    .reply(200, { commencementDate: '2020-02-01T00:00:00' });
};

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    mocks();
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

fixture('commencement-date page - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      // eslint-disable-next-line no-console
      console.log(`pending mocks: ${nock.pendingMocks()}`);
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should populate input fields for day, month and year if data is returned from api', async (t) => {
  await pageSetup(t, true);
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

test('should navigate to task list page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/commencement-date')
    .reply(200, {});

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

// FE Validation tests
test('should show the correct error summary and input error when date is removed and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

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
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Enter a commencement date')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.hasClass('nhsuk-input--error')).ok()
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()
    .expect(yearInput.hasClass('nhsuk-input--error')).ok();
});

test('should show the correct error summary and input error when no day is removed and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(dayInput).pressKey('delete')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must include a day')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('2020')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk();
});

test('should show the correct error summary and input error when no month is removed and save is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete')
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must include a month')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
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
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete')
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must include a year')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

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
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete').typeText(yearInput, '202020', { paste: true })
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Year must be four numbers')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('202020')
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
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete').typeText(yearInput, '20', { paste: true })
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Year must be four numbers')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('20')
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
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(dayInput).pressKey('delete').typeText(dayInput, '32', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be a real date')
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
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#commencementDate-error span');
  const dayInput = Selector('#commencementDate-day');
  const monthInput = Selector('#commencementDate-month');
  const yearInput = Selector('#commencementDate-year');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(monthInput).pressKey('delete').typeText(monthInput, '13', { paste: true })
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be a real date')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('13')
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
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
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(yearInput).pressKey('delete').typeText(yearInput, '0999', { paste: true })
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be a real date')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()

    .expect(yearInput.getAttribute('value')).eql('0999')
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
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(dayInput).pressKey('delete').typeText(dayInput, '31', { paste: true })
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be a real date')
    .expect(errorMessage.exists).ok()
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
    .expect(errorMessage.exists).notOk()
    .expect(dayInput.hasClass('nhsuk-input--error')).notOk()
    .expect(monthInput.hasClass('nhsuk-input--error')).notOk()
    .expect(yearInput.hasClass('nhsuk-input--error')).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Commencement date must be in the future or within the last 60 days')
    .expect(errorMessage.exists).ok()
    .expect(await extractInnerText(errorMessage)).eql('Error:')

    .expect(dayInput.getAttribute('value')).eql('01')
    .expect(dayInput.hasClass('nhsuk-input--error')).ok()

    .expect(monthInput.getAttribute('value')).eql('02')
    .expect(monthInput.hasClass('nhsuk-input--error')).ok()

    .expect(yearInput.getAttribute('value')).eql('2020')
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

  await t
    .expect(errorMessage.exists).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#commencementDate`);
});

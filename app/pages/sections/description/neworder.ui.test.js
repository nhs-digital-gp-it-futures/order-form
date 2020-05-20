import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from './manifest.json';
import { orderApiUrl } from '../../../config';

const pageUrl = 'http://localhost:1234/organisation/neworder/description';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Description page (new order)')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

const postDescriptionErrorResponse = {
  errors: [
    {
      field: 'Description',
      id: 'OrderDescriptionTooLong',
    },
  ],
};

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  await pageSetup(t);
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render description page', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="description-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/neworder when click Back', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/neworder');
});

test('should render the title', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="description-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(content.title);
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="description-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a textarea for description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="question-description"]');
  const footerAdvice = Selector('[data-test-id="textarea-field-footer"] span');

  await t
    .expect(description.exists).ok()
    .expect(description.find('textarea').count).eql(1)
    .expect(footerAdvice.exists).ok()
    .expect(await extractInnerText(footerAdvice)).eql(content.questions[0].footerAdvice);
});

test('should not populate the text area with existing decription data', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="question-description"] textarea');

  await t
    .expect(description.exists).ok()
    .expect(description.value).eql('');
});

test('should render save button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});

test('should navigate to task list page when valid description is added and save is clicked', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders')
    .reply(200, { orderId: 'order1' });

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .expect(saveButton.exists).ok()
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order1');
});

test('should show the error summary when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders')
    .reply(400, postDescriptionErrorResponse);

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Description must be 100 characters or fewer');
});

test('should show text fields as errors with error message when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders')
    .reply(400, postDescriptionErrorResponse);

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const descriptionPage = Selector('[data-test-id="description-page"]');
  const saveButton = Selector('[data-test-id="save-button"] button');
  const descriptionField = descriptionPage.find('[data-test-id="question-description"]');

  await t
    .expect(descriptionField.find('[data-test-id="textarea-field-error"]').exists).notOk()
    .click(saveButton);

  await t
    .expect(descriptionField.find('[data-test-id="textarea-field-error"]').exists).ok()
    .expect(await extractInnerText(descriptionField.find('#description-error'))).contains('Description must be 100 characters or fewer');
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders')
    .reply(400, postDescriptionErrorResponse);

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#description`);
});

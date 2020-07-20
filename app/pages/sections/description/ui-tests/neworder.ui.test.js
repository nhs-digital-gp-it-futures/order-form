import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../config';
import { nockCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/neworder/description';

const postDescriptionErrorResponse = {
  errors: [
    {
      field: 'Description',
      id: 'OrderDescriptionTooLong',
    },
  ],
};

const pageSetup = async (withAuth = true) => {
  if (withAuth) await setState(ClientFunction)('fakeToken', authTokenInSession);
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Description page - new order')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockCheck(nock, t);
  });

test('should link to /order/organisation/order-1 for backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/neworder');
});

test('should not populate the text area with existing decription data', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="question-description"] textarea');

  await t
    .expect(description.value).eql('');
});

test('should navigate to task list page when valid description is added and save is clicked', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders', { description: 'some description', organisationId: 'org-id' })
    .reply(200, { orderId: 'order1' });

  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="question-description"] textarea');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(description, 'some description', { paste: true })
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order1');
});

test('should show the error summary when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders', { description: '', organisationId: 'org-id' })
    .reply(400, postDescriptionErrorResponse);

  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Description must be 100 characters or fewer');
});

test('should show text fields as errors with error message when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders', { description: '', organisationId: 'org-id' })
    .reply(400, postDescriptionErrorResponse);

  await pageSetup(true);
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
    .post('/api/v1/orders', { description: '', organisationId: 'org-id' })
    .reply(400, postDescriptionErrorResponse);

  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(saveButton);

  await t
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#description`);
});

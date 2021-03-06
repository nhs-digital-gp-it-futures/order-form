import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl, organisationApiUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';
import mockOrgData from '../../../../test-utils/mockData/mockOrganisationData.json';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/neworder/description';

const mocks = () => {
  nock(organisationApiUrl)
    .get('/api/v1/ods/odsCode')
    .reply(200, mockOrgData);
};

const postDescriptionErrorResponse = {
  errors: [
    {
      field: 'Description',
      id: 'DescriptionTooLong',
    },
  ],
};

const pageSetup = async (setup = { withAuth: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  mocks();
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Description page - new order')
  .page('http://localhost:1234/order/some-fake-page')
  .beforeEach(async () => {
    nock(organisationApiUrl)
      .get('/api/v1/ods/odsCode')
      .reply(200, mockOrgData);
  })
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should link to /order/organisation/odsCode/order/order-1 for backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/odsCode/order/neworder');
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
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order1');
});

test('should show the error summary when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders', { description: '', organisationId: 'org-id' })
    .reply(400, postDescriptionErrorResponse);

  await pageSetup();
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

  await pageSetup();
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

  await pageSetup();
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

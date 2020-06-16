import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/description';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const postDescriptionErrorResponse = {
  errors: [
    {
      field: 'Description',
      id: 'OrderDescriptionTooLong',
    },
  ],
};

const mocks = (putErrorNock) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/description')
    .reply(200, { description: 'a lovely description' });
  if (putErrorNock) {
    nock(orderApiUrl)
      .put('/api/v1/orders/order-id/sections/description')
      .reply(400, postDescriptionErrorResponse);
  }
};

const pageSetup = async (withAuth = true, putErrorNock = false) => {
  if (withAuth) {
    mocks(putErrorNock);
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Description page - existing order')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should navigate to /organisation/order-id when click on backLink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

test('should populate the text area with existing decription data', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="question-description"] textarea');

  await t
    .expect(description.exists).ok()
    .expect(description.value).eql('a lovely description');
});

test('should navigate to task list page when valid description is added and save is clicked', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/description')
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .expect(saveButton.exists).ok()
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

test('should show the error summary when there are validation errors', async (t) => {
  await pageSetup(true, true);
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
    .put('/api/v1/orders/order-id/sections/description')
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
  await pageSetup(true, true);
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

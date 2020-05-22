import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from './manifest.json';

const pageUrl = 'http://localhost:1234/organisation/order-1/supplier/search';

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

fixture('Supplier search page')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
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

test('should render Supplier search page', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="supplier-search-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-1 when click on backlink', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1');
});

test('should render the title', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="supplier-search-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-1`);
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="supplier-search-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a supplierName question as a textfield', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const supplierNameInput = Selector('[data-test-id="question-supplierName"]');

  await t
    .expect(supplierNameInput.exists).ok()
    .expect(supplierNameInput.find('input').count).eql(1);
});

test('should render the Search button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="search-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.searchButtonText);
});

test('should show the error summary when there are validation errors', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const searchButton = Selector('[data-test-id="search-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(searchButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('Enter a supplier name or part of a supplier name');
});

test('should show text fields as errors with error message when there are validation errors', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const supplierSearchPage = Selector('[data-test-id="supplier-search-page"]');
  const searchButton = Selector('[data-test-id="search-button"] button');
  const supplierNameField = supplierSearchPage.find('[data-test-id="question-supplierName"]');

  await t
    .expect(supplierNameField.find('[data-test-id="text-field-input-error"]').exists).notOk()
    .click(searchButton);

  await t
    .expect(supplierNameField.find('[data-test-id="text-field-input-error"]').exists).ok()
    .expect(await extractInnerText(supplierNameField.find('#supplierName-error'))).contains('Enter a supplier name or part of a supplier name');
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const searchButton = Selector('[data-test-id="search-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(searchButton);

  await t
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#supplierName`);
});

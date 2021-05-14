import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-id/supplier/search';

const mocks = (data) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, data);
};

const defaultPageSetup = { withAuth: true, getRoute: true, mockData: {} };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks(setup.mockData);
  }
};

const orderData = { name: 'a lovely order' };

const getLocation = ClientFunction(() => document.location.href);

fixture('Supplier search page')
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

test('should render Supplier search page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="supplier-search-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/odsCode/order/order-id for backLink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/odsCode/order/order-id');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="supplier-search-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="supplier-search-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a supplierName question as a textfield', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const supplierNameInput = Selector('[data-test-id="question-supplierName"]');

  await t
    .expect(supplierNameInput.find('input').count).eql(1);
});

test('should render the Search button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const searchButton = Selector('[data-test-id="search-button"] button');

  await t
    .expect(await extractInnerText(searchButton)).eql(content.searchButtonText);
});

test('should redirect to /organisation/odsCode/order/order-id/supplier/search/select when suppliers are returned', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers?name=some-supp&solutionPublicationStatus=Published')
    .reply(200, [{}]);

  await pageSetup();
  await t.navigateTo(pageUrl);

  const supplierNameInput = Selector('[data-test-id="question-supplierName"]');
  const searchButton = Selector('[data-test-id="search-button"] button');

  await t
    .typeText(supplierNameInput.find('input'), 'some-supp')
    .click(searchButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id/supplier/search/select');
});

test('should render the error page if no suppliers are found', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers?name=some-supp&solutionPublicationStatus=Published')
    .reply(200, []);

  await pageSetup();
  await t.navigateTo(pageUrl);

  const supplierNameInput = Selector('[data-test-id="question-supplierName"]');
  const searchButton = Selector('[data-test-id="search-button"] button');
  const backLink = Selector('[data-test-id="error-back-link"]');
  const errorTitle = Selector('[data-test-id="error-title"]');
  const errorDescription = Selector('[data-test-id="error-description"]');

  await t
    .typeText(supplierNameInput.find('input'), 'some-supp')
    .click(searchButton);

  await t
    .expect(await extractInnerText(backLink)).eql('Go back to search')
    .expect(backLink.find('a').getAttribute('href')).ok('/order/organisation/odsCode/order/order-id/supplier/search')
    .expect(await extractInnerText(errorTitle)).eql('No supplier found')
    .expect(await extractInnerText(errorDescription)).eql("There are no suppliers that match the search terms you've provided. Try searching again.");
});

test('should show the error summary when there are validation errors', async (t) => {
  await pageSetup();
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

test('should show text field as errors with error message when there are validation errors', async (t) => {
  await pageSetup();
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
  await pageSetup();
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

test('should redirect to /organisation/odsCode/order/order-id/supplier when ORDAPI returns order data', async (t) => {
  await pageSetup({ ...defaultPageSetup, mockData: orderData });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id/supplier');
});

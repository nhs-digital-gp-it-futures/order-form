import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { solutionsApiUrl } from '../../../../config';
import content from './manifest.json';

const pageUrl = 'http://localhost:1234/organisation/order-1/supplier/search/select';

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

fixture('Supplier select page')
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

test('should render Supplier select page', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers?name=some-supp')
    .reply(200, [{}]);

  await pageSetup(t, true);
  await t.navigateTo(`${pageUrl}?name=some-supp`);
  const page = Selector('[data-test-id="supplier-select-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-1/supplier/search when click on backlink', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers?name=some-supp')
    .reply(200, [{}]);

  await pageSetup(t, true);
  await t.navigateTo(`${pageUrl}?name=some-supp`);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/supplier/search');
});

test('should render the title', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers?name=some-supp')
    .reply(200, [{}]);

  await pageSetup(t, true);
  await t.navigateTo(`${pageUrl}?name=some-supp`);

  const title = Selector('h1[data-test-id="supplier-select-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(content.title);
});

test('should render the description', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers?name=some-supp')
    .reply(200, [{}]);

  await pageSetup(t, true);
  await t.navigateTo(`${pageUrl}?name=some-supp`);

  const description = Selector('h2[data-test-id="supplier-select-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectSupplier question as radio button options', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers?name=some-supp')
    .reply(200, [
      { supplierId: 'supplier-1', name: 'Supplier 1' },
      { supplierId: 'supplier-2', name: 'Supplier 2' },
    ]);

  await pageSetup(t, true);
  await t.navigateTo(`${pageUrl}?name=some-supp`);

  const selectSupplierRadioOptions = Selector('[data-test-id="question-selectSupplier"]');

  await t
    .expect(selectSupplierRadioOptions.exists).ok()
    .expect(await extractInnerText(selectSupplierRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectSupplierRadioOptions.find('input').count).eql(2)

    .expect(selectSupplierRadioOptions.find('input').nth(0).getAttribute('value')).eql('supplier-1')
    .expect(await extractInnerText(selectSupplierRadioOptions.find('label').nth(0))).eql('Supplier 1')

    .expect(selectSupplierRadioOptions.find('input').nth(1).getAttribute('value')).eql('supplier-2')
    .expect(await extractInnerText(selectSupplierRadioOptions.find('label').nth(1))).eql('Supplier 2');
});

test('should render the Continue button', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers?name=some-supp')
    .reply(200, [{}]);

  await pageSetup(t, true);
  await t.navigateTo(`${pageUrl}?name=some-supp`);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect to the search page if a supplier to find is not pass in the url', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(`${pageUrl}`);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/supplier/search');
});


test('should show the error page if no suppliers are returned', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers?name=some-supp')
    .reply(200, []);

  await pageSetup(t, true);
  await t.navigateTo(`${pageUrl}?name=some-supp`);

  const backLink = Selector('[data-test-id="error-back-link"]');
  const errorTitle = Selector('[data-test-id="error-title"]');
  const errorDescription = Selector('[data-test-id="error-description"]');

  await t
    .expect(backLink.exists).ok()
    .expect(await extractInnerText(backLink)).eql('Go back to search')
    .expect(backLink.find('a').getAttribute('href')).ok('/order/organisation/order-1/supplier/search')
    .expect(errorTitle.exists).ok()
    .expect(await extractInnerText(errorTitle)).eql('No Supplier found')
    .expect(errorDescription.exists).ok()
    .expect(await extractInnerText(errorDescription)).eql("There are no suppliers that match the search terms you've provided. Try searching again.");
});

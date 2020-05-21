import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { solutionsApiUrl } from '../../../../config';

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
  await t.navigateTo(`${pageUrl}?supplierNameToFind=some-supp`);

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

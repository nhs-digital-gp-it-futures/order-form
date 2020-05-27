import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from './manifest.json';
import { solutionsApiUrl } from '../../../../config';

const pageUrl = 'http://localhost:1234/organisation/order-1/supplier';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const setSessionState = ClientFunction(() => {
  const cookieValue = 'supplier-1';

  document.cookie = `selectedSupplier=${cookieValue}`;
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, {});
};

const pageSetup = async (t, withAuth = false, withSessionState = false) => {
  if (withAuth) await setCookies();
  if (withSessionState) await setSessionState();
  if (withAuth && withSessionState) mocks();
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Supplier page')
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

test('should render Supplier page', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="supplier-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-1/supplier/search/select when click on backlink', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/supplier/search/select');
});

test('should render the title', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="supplier-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-1`);
});

test('should render the description', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="supplier-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the inset advice', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const insetAdvice = Selector('[data-test-id="supplier-page-insetAdvice"]');

  await t
    .expect(insetAdvice.exists).ok()
    .expect(await extractInnerText(insetAdvice)).contains(content.insetAdvice);
});

test('should render the "Save and return" button', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});


test('should redirect to /organisation/order-1/supplier/search if there are supplierSelected returned from the session', async (t) => {
  await pageSetup(t, true, false);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/supplier/search');
});

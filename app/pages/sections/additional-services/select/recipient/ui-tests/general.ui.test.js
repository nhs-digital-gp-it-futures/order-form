import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service/price/recipient';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const selectedItemNameState = ClientFunction(() => {
  const cookieValue = 'Additional Service';

  document.cookie = `selectedItemName=${cookieValue}`;
});

const pageSetup = async (withAuth = true) => {
  if (withAuth) {
    await setCookies();
    await selectedItemNameState();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Aditional-service - recipient page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup(false);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render Aditional-service select-recipient page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="additional-service-recipient-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to organisation/order-id/additional-services/select/additional-service/price when click on backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service/price');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="additional-service-recipient-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} Additional Service`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="additional-service-recipient-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

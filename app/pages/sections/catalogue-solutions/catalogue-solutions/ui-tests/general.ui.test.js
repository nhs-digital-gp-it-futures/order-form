import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/catalogue-solutions')
    .reply(200, { orderDescription: 'Some order' });
};

const pageSetup = async (withAuth = true) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions page - general')
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

test('should render catalogue-solutions page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="catalogue-solutions-page"]');

  await t
    .expect(page.exists).ok();
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

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="catalogue-solutions-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="catalogue-solutions-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the inset advice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const insetAdvice = Selector('[data-test-id="catalogue-solutions-page-insetAdvice"]');

  await t
    .expect(insetAdvice.exists).ok()
    .expect(await extractInnerText(insetAdvice)).contains(content.insetAdvice);
});

test('should render the orderDescription', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescriptionHeading = Selector('h3[data-test-id="order-description-heading"]');
  const orderDescription = Selector('h4[data-test-id="order-description"]');

  await t
    .expect(orderDescriptionHeading.exists).ok()
    .expect(await extractInnerText(orderDescriptionHeading)).contains(content.orderDescriptionHeading)
    .expect(orderDescription.exists).ok()
    .expect(await extractInnerText(orderDescription)).contains('Some order');
});

test('should render the Add Catalogue Solution button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addSolutionButton = Selector('[data-test-id="add-solution-button"] a');

  await t
    .expect(addSolutionButton.exists).ok()
    .expect(await extractInnerText(addSolutionButton)).eql(content.addSolutionButtonText);
});

test('should navigate to /organisation/order-id/catalogue-solutions/select/solution when Add Catalogue Solution button is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addSolutionButton = Selector('[data-test-id="add-solution-button"] a');

  await t
    .click(addSolutionButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions/select/solution');
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(continueButton.exists).ok()
    .expect(await extractInnerText(continueButton)).eql(content.continueButtonText);
});

test('should redirect to /organisation/order-id when clicking the Continue button', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/catalogue-solutions')
    .reply(200);

  await pageSetup();
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="continue-button"] button');

  await t
    .click(continueButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../commonManifest.json';
import { solutionsApiUrl } from '../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/order-item-id';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const selectedSolutionIdState = ClientFunction(() => {
  const cookieValue = 'solution-1';

  document.cookie = `selectedSolutionId=${cookieValue}`;
});

const solutionNameState = ClientFunction(() => {
  const cookieValue = 'solution-name';

  document.cookie = `solutionName=${cookieValue}`;
});

const selectedRecipientIdState = ClientFunction(() => {
  const cookieValue = 'recipient-1';

  document.cookie = `selectedRecipientId=${cookieValue}`;
});

const selectedRecipientNameState = ClientFunction(() => {
  const cookieValue = 'recipient-name';

  document.cookie = `selectedRecipientName=${cookieValue}`;
});

const selectedPriceIdState = ClientFunction(() => {
  const cookieValue = 'price-1';

  document.cookie = `selectedPriceId=${cookieValue}`;
});

const selectedPrice = {
  priceId: 1,
  provisioningType: 'OnDemand',
  type: 'Flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.1,
};

const selectedPriceState = ClientFunction((selectedPriceValue) => {
  const cookieValue = JSON.stringify(selectedPriceValue);

  document.cookie = `selectedPrice=${cookieValue}`;
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/solutions/solution-1')
    .reply(200, { id: 'solution-1', name: 'Solution One' });

  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const pageSetup = async (withAuth = true, postRoute = false, priceValidation = false) => {
  if (withAuth) {
    mocks(priceValidation);
    await setCookies();
    await selectedRecipientIdState();
    await selectedRecipientNameState();
    await selectedSolutionIdState();
    await selectedPriceIdState();
    if (postRoute) {
      await solutionNameState();
      await selectedPriceState(selectedPrice);
    }
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions - recipient page - general')
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

test('should render Catalogue-solutions order-item page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="order-item-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id/catalogue-solutions/select/solution/recipient when click on backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions/select/solution/recipient');
});

test.only('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql('Solution One information for recipient-name (recipient-1)');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-item-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the delete button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="delete-button"] a');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.deleteButtonText);
});

test('should render the save button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});

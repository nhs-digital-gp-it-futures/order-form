import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import commonContent from '../commonManifest.json';
import { solutionsApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/associated-services/neworderitem';

const selectedPrice = {
  priceId: 1,
  provisioningType: 'OnDemand',
  type: 'Flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  price: 0.11,
};

const itemIdInSession = 'item-1';
const itemNameInSession = 'Item One';
const selectedPriceIdInSession = 'price-1';

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
  selectedPrice,
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, selectedPrice);
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
    await setState(ClientFunction)('fakeToken', authTokenInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemId, itemIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemName, itemNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Associated-services order items - common - general')
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

test('should render associated-services order-item page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="order-item-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-1/associated-services/select/associated-service/price for backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-1/associated-services/select/associated-service/price');
});

test('should link to /order/organisation/order-1/associated-services/select/associated-service/price for backlink after validation errors', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .click(saveButton)
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-1/associated-services/select/associated-service/price');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Item One information for order-1');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-item-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(commonContent.description);
});

test('should render the delete button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="delete-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(commonContent.deleteButton.text)
    .expect(button.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(button.hasClass('nhsuk-button--disabled')).eql(true);
});

test('delete button should still be disabled after validation errors', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const deleteButton = Selector('[data-test-id="delete-button"] button');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .click(saveButton)
    .expect(deleteButton.exists).ok()
    .expect(await extractInnerText(deleteButton)).eql(commonContent.deleteButton.text)
    .expect(deleteButton.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(deleteButton.hasClass('nhsuk-button--disabled')).eql(true);
});

test('should render the save button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(commonContent.saveButtonText);
});

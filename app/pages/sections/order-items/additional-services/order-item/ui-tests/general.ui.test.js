import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import commonContent from '../commonManifest.json';
import { solutionsApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/additional-services/neworderitem';

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
const catalogueItem = { id: 'item-1', name: 'Item One' };

const itemIdInSession = 'item-1';
const itemNameInSession = 'Item One';
const selectedRecipientIdInSession = 'recipient-1';
const selectedRecipientNameInSession = 'recipient-name';
const selectedPriceIdInSession = 'price-1';

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: catalogueItem.name,
  serviceRecipientId: selectedRecipientIdInSession,
  serviceRecipientName: selectedRecipientNameInSession,
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
    await setState(ClientFunction)('selectedRecipientId', selectedRecipientIdInSession);
    await setState(ClientFunction)('selectedRecipientName', selectedRecipientNameInSession);
    await setState(ClientFunction)('selectedItemId', itemIdInSession);
    await setState(ClientFunction)('selectedItemName', itemNameInSession);
    await setState(ClientFunction)('selectedPriceId', selectedPriceIdInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)('orderItemPageData', orderItemPageDataInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Additional-services order items - common - general')
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

test('should render additional-services order-item page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="order-item-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-1/additional-services/select/additional-service/recipient for backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-1/additional-services/select/additional-service/price/recipient');
});

test('should link to /order/organisation/order-1/additional-services/select/solution/price/recipient for backlink after validation errors', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .click(saveButton)
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-1/additional-services/select/additional-service/price/recipient');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Item One information for recipient-name (recipient-1)');
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

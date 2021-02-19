import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import commonContent from '../commonManifest.json';
import content from '../flat/patient/manifest.json';
import { solutionsApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/neworderitem';

const selectedPrice = {
  priceId: 2,
  provisioningType: 'Patient',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'patient',
    description: 'per patient',
  },
  timeUnit: {
    name: 'year',
    description: 'per year',
  },
  price: 1.64,
};

const itemIdInSession = 'solution-1';
const itemNameInSession = 'Solution One';
const selectedRecipientIdInSession = 'recipient-1';
const selectedRecipientNameInSession = 'recipient-name';
const selectedPriceIdInSession = 'price-1';
const catalogueSolutionIdInSession = 'solution-1';
const plannedDeliveryDateInSession = '2020-10-10';
const recipientsInSession = JSON.stringify([{ name: 'recipient-name', odsCode: 'code' }]);
const selectedRecipientsInSession = JSON.stringify(['code']);

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
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
    await setState(ClientFunction)(sessionKeys.selectedItemId, itemIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemName, itemNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientId, selectedRecipientIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientName, selectedRecipientNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
    await setState(ClientFunction)(sessionKeys.catalogueSolutionId, catalogueSolutionIdInSession);
    await setState(ClientFunction)(sessionKeys.plannedDeliveryDate, plannedDeliveryDateInSession);
    await setState(ClientFunction)(sessionKeys.recipients, recipientsInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipients, selectedRecipientsInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions - common - general')
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

test('should render Catalogue-solutions order-item page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="order-item-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-id/catalogue-solutions/select/solution/recipients/date for backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id/catalogue-solutions/select/solution/price/recipients/date');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Solution One information for order-id');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-item-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(commonContent.description);
});

test('should render a text field for the price question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const quantity = Selector('[data-test-id="question-price"]');
  const quantityLabel = quantity.find('label.nhsuk-label');

  await t
    .expect(quantity.exists).ok()
    .expect(await extractInnerText(quantityLabel)).eql(content.questions.price.mainAdvice)
    .expect(quantity.find('input').count).eql(1);
});

test('should render an expandable section for the price question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const expandableSection = Selector('[data-test-id="view-section-price-id"]');

  await t
    .expect(expandableSection.exists).ok()
    .expect(await extractInnerText(expandableSection)).eql(content.questions.price.expandableSection.title)
    .expect(expandableSection.find('details[open]').exists).notOk()
    .click(expandableSection.find('summary'))
    .expect(expandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(expandableSection.find('.nhsuk-details__text')))
    .eql(content.questions.price.expandableSection.innerComponent);
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

test('should render the edit button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="edit-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(commonContent.editButton.text)
    .expect(button.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(button.hasClass('nhsuk-button--disabled')).eql(true);
});

test('should render the save button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(commonContent.saveButtonText);
});

import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';

const getLocation = ClientFunction(() => document.location.href);

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/neworderitem';

const selectedPrice = {
  priceId: 2,
  provisioningType: 'patient',
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
const recipients = [{ name: 'recipient-name', odsCode: 'code' }, { name: 'recipient-name', odsCode: 'code-not-used' }];
const selectedRecipients = ['code'];

const itemIdInSession = 'item-1';
const itemNameInSession = 'Item name';
const selectedRecipientIdInSession = 'recipient-1';
const selectedRecipientNameInSession = 'recipient-name';
const selectedPriceIdInSession = 'price-1';
const catalogueSolutionIdInSession = 'solution-1';
const deliveryDateInSession = '2020-10-10';
const recipientsInSession = JSON.stringify(recipients);
const selectedRecipientsInSession = JSON.stringify(selectedRecipients);

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
  serviceRecipientId: selectedRecipientIdInSession,
  serviceRecipientName: selectedRecipientNameInSession,
  selectedPrice,
  recipients,
  deliveryDate: deliveryDateInSession,
  selectedRecipients,
});

const requestPostBody = {
  ...selectedPrice,
  serviceRecipient: { name: 'recipient-name', odsCode: 'code' },
  catalogueItemId: 'item-1',
  catalogueItemName: 'Item name',
  catalogueItemType: 'Solution',
  deliveryDate: '2020-10-10',
  estimationPeriod: 'year',
};

const mocks = (mockSelectedPrice) => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, mockSelectedPrice);
};

const defaultPageSetup = {
  withAuth: true, getRoute: true, postRoute: true, mockData: selectedPrice,
};
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks(setup.mockData);
    await setState(ClientFunction)('fakeToken', authTokenInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientId, selectedRecipientIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientName, selectedRecipientNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemId, itemIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemName, itemNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
    await setState(ClientFunction)(sessionKeys.catalogueSolutionId, catalogueSolutionIdInSession);
    await setState(ClientFunction)(sessionKeys.plannedDeliveryDate, deliveryDateInSession);
    await setState(ClientFunction)(sessionKeys.recipients, recipientsInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipients, selectedRecipientsInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

fixture('Catalogue-solutions - flat patient - withoutSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should navigate to catalogue-solutions dashboard page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-id/order-items/batch', [{ ...requestPostBody, quantity: 10 }])
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const quantityInput = Selector('[data-test-id="question-practiceSize"]');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '10', { paste: true })
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions');
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .post('/api/v1/orders/order-id/order-items/batch', [{ ...requestPostBody, quantity: 0 }])
    .reply(400, {
      errors: {
        '[0].PracticeSize': ['PracticeSizeGreaterThanZero'],
      },
    });

  await pageSetup();
  await t.navigateTo(pageUrl);

  const errorSummary = Selector('[data-test-id="error-summary"]');
  const solutionTableError = Selector('[data-test-id="solution-table-error"]');
  const practiceSizeInput = Selector('[data-test-id="question-practiceSize"] input');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(practiceSizeInput, '0', { paste: true })
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.PracticeSizeGreaterThanZero)

    .expect(solutionTableError.exists).ok()
    .expect(await extractInnerText(solutionTableError)).contains(content.errorMessages.PracticeSizeGreaterThanZero);
});

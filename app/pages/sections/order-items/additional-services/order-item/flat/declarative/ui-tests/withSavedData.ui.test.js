import nock from 'nock';
import { ClientFunction } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl, solutionsApiUrl } from '../../../../../../../../config';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';
import AdditionalServicePageModel from '../../additionalServicesPageModel';

const organisation = 'organisation';
const callOffId = 'order-1';
const priceId = '1018';
const catalogueItemId = '10000-001';

const pageUrl = `http://localhost:1234/order/${organisation}/${callOffId}/additional-services/${catalogueItemId}`;

const getLocation = ClientFunction(() => document.location.href);

const deliveryDate = '2020-12-12';

const orderItem = {
  serviceRecipients: [{
    odsCode: 'OX3',
    name: 'Some service recipient 2',
    deliveryDate,
    quantity: 10,
  }],
  catalogueItemType: 'AdditionalService',
  catalogueItemName: 'Some item name',
  catalogueItemId,
  estimationPeriod: 'year',
  provisioningType: 'Declarative',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'consultation',
    description: 'per consultation',
  },
  timeUnit: {
    name: 'year',
    description: 'per year',
  },
  price: 0.1,
  priceId,
};

const recipient1 = { name: 'recipient-name', odsCode: 'code' };
const recipient2 = { name: 'recipient-name', odsCode: 'code-not-used' };
const recipients = [recipient1, recipient2];
const selectedRecipients = ['code'];

const selectedPrice = {
  currencyCode: 'GBP',
  price: orderItem.price,
  itemUnit: orderItem.itemUnit,
  timeUnit: orderItem.timeUnit,
  type: orderItem.type,
  provisioningType: orderItem.provisioningType,
  estimationPeriod: orderItem.estimationPeriod,
  originalPrice: '10.0001',
  priceId,
};

const orderItemPageDataInSession = JSON.stringify({
  itemId: orderItem.catalogueItemId,
  itemName: orderItem.catalogueItemName,
  serviceRecipientId: orderItem.serviceRecipients[0].odsCode,
  serviceRecipientName: orderItem.serviceRecipients[0].name,
  selectedPrice,
  recipients,
  deliveryDate,
  selectedRecipients,
});

const baseServiceRecipient = { ...recipient1, deliveryDate };
const validServiceRecipient = { ...baseServiceRecipient, quantity: 10 };
const invalidServiceRecipient = { ...baseServiceRecipient, quantity: 0 };

const baseRequestBody = {
  ...selectedPrice,
  catalogueItemId: orderItem.catalogueItemId,
  catalogueItemName: orderItem.catalogueItemName,
  catalogueItemType: orderItem.catalogueItemType,
  orderItemId: null,
};

const validRequestBody = {
  ...baseRequestBody,
  serviceRecipients: [validServiceRecipient],
};

const invalidRequestBody = {
  ...baseRequestBody,
  serviceRecipients: [invalidServiceRecipient],
};

const mocks = () => {
  nock(orderApiUrl)
    .get(`/api/v1/orders/${callOffId}/order-items`)
    .reply(200, [orderItem]);
  nock(solutionsApiUrl)
    .get(`/api/v1/prices/${priceId}`)
    .reply(200, orderItem);
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

fixture('Additional-services - flat declarative - withSavedData')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  const title = pageModel.pageTitle;

  await t
    .expect(await extractInnerText(title)).eql(`${orderItem.catalogueItemName} information for ${callOffId}`);
});

test(`should link to /order/${organisation}/${callOffId}/additional-services for backlink`, async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  const { goBackLink } = pageModel;

  await t
    .expect(goBackLink.getAttribute('href')).eql(`/order/${organisation}/${callOffId}/additional-services`);
});

test('should populate text field for the quantity question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  const quantity = pageModel.quantityInput;

  await t
    .expect(quantity.getAttribute('value'))
    .eql(orderItem.serviceRecipients[0].quantity.toString());
});

test('should render the price content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  const { priceInput } = pageModel;

  await t
    .expect(priceInput.getAttribute('value')).eql('0.10');
});

test('should render the delete button as not disabled', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  const button = pageModel.deleteButton;

  await t
    .expect(await extractInnerText(button)).eql('Delete Additional Service')
    .expect(button.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(button.hasClass('nhsuk-button--disabled')).eql(false);
});

test('should show the correct error summary and input error when the quantity is removed and save is clicked', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.errorSummary.exists).notOk()
    .expect(pageModel.quantityInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(pageModel.quantityInput).pressKey('delete')
    .click(pageModel.saveButton);

  await t
    .expect(pageModel.errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(pageModel.errorSummary.find('li a').nth(0)))
    .eql(content.errorMessages.QuantityRequired);
});

test('should show the correct error summary and input error when the price is removed and save is clicked', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .expect(pageModel.errorSummary.exists).notOk()
    .expect(pageModel.priceInput.hasClass('nhsuk-input--error')).notOk()
    .selectText(pageModel.priceInput).pressKey('delete')
    .click(pageModel.saveButton);

  await t
    .expect(pageModel.errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(pageModel.errorSummary.find('li a').nth(0)))
    .eql(content.errorMessages.PriceRequired)
    .expect(pageModel.priceInput.hasClass('nhsuk-input--error')).ok();
});

test('should navigate to additional services dashboard page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put(`/api/v1/orders/${callOffId}/order-items/${catalogueItemId}`, validRequestBody)
    .reply(200, {});

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .click(pageModel.saveButton)
    .expect(getLocation()).eql(`http://localhost:1234/order/${organisation}/${callOffId}/additional-services`);
});

test('should show text fields as errors with error message when there are BE validation errors', async (t) => {
  nock(orderApiUrl)
    .put(`/api/v1/orders/${callOffId}/order-items/${catalogueItemId}`, invalidRequestBody)
    .reply(400, {
      errors: {
        'ServiceRecipients[0].Quantity': ['QuantityGreaterThanZero'],
      },
    });

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const pageModel = new AdditionalServicePageModel();

  await t
    .typeText(pageModel.quantityInput, '0', { replace: true })
    .click(pageModel.saveButton);

  await t
    .expect(pageModel.errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(pageModel.errorSummary.find('li a').nth(0)))
    .eql(content.errorMessages.QuantityGreaterThanZero)
    .expect(pageModel.quantityInput.getAttribute('value')).eql('0');
});

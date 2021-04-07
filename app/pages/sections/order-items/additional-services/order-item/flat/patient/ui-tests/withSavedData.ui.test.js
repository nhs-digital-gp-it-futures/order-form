import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../../../../../config';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';

const organisation = 'organisation';
const callOffId = 'order-1';
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
  price: 0.1,
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

  const title = Selector('h1[data-test-id="order-item-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`Some item name information for ${callOffId}`);
});

// TODO: fix when feature completed
test(`should link to /order/${organisation}/${callOffId}/additional-services for backlink`, async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  // need to update below url to /order/${organisation}/${callOffId}/additional-services once feature is added
  await t
    .expect(goBackLink.getAttribute('href')).eql(`/order/${organisation}/${callOffId}/additional-services/select/additional-service/price/recipients/date`);
});

test('should populate text field for the price question', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const price = Selector('[data-test-id="question-price"] input');

  await t
    .expect(price.getAttribute('value')).eql('0.10');
});

test('should render the solution table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="solution-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const solutionName = row.find('div[data-test-id="Some service recipient 2-OX3-recipient"]');
  const quantityInput = row.find('[data-test-id="question-quantity"] input');
  const quantityExpandableSection = row.find('[data-test-id="view-section-input-id-practice"]');
  const dateInput = row.find('[data-test-id="question-deliveryDate"] input');
  const dayInput = dateInput.nth(0);
  const monthInput = dateInput.nth(1);
  const yearInput = dateInput.nth(2);
  const dateExpandableSection = row.find('[data-test-id="view-section-input-id-date"]');

  await t
    .expect(row.exists).ok()
    .expect(solutionName.exists).ok()
    .expect(await extractInnerText(solutionName)).eql('Some service recipient 2 (OX3)')

    .expect(quantityInput.exists).ok()
    .expect(quantityExpandableSection.exists).ok()
    .expect(await extractInnerText(quantityExpandableSection)).eql(content.solutionTable.cellInfo.quantity.expandableSection.title)
    .expect(quantityExpandableSection.find('details[open]').exists).notOk()
    .click(quantityExpandableSection.find('summary'))
    .expect(quantityExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(quantityExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.quantity.expandableSection.innerComponent.replace('<br><br>', ''))

    .expect(dateInput.exists).ok()
    .expect(dayInput.getAttribute('id')).eql('deliveryDate-day')
    .expect(dayInput.getAttribute('name')).eql('deliveryDate-day')
    .expect(dayInput.getAttribute('value')).eql('12')

    .expect(monthInput.getAttribute('id')).eql('deliveryDate-month')
    .expect(monthInput.getAttribute('name')).eql('deliveryDate-month')
    .expect(monthInput.getAttribute('value')).eql('12')

    .expect(yearInput.getAttribute('id')).eql('deliveryDate-year')
    .expect(yearInput.getAttribute('name')).eql('deliveryDate-year')
    .expect(yearInput.getAttribute('value')).eql('2020')

    .expect(dateExpandableSection.exists).ok()
    .expect(await extractInnerText(dateExpandableSection)).eql(content.solutionTable.cellInfo.deliveryDate.expandableSection.title)
    .expect(dateExpandableSection.find('details[open]').exists).notOk()
    .click(dateExpandableSection.find('summary'))
    .expect(dateExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(dateExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.deliveryDate.expandableSection.innerComponent.replace('<br><br>', ''));
});

test('should render the delete button as not disabled', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="delete-button"] a');

  await t
    .expect(await extractInnerText(button)).eql('Delete Catalogue Solution')
    .expect(button.hasClass('nhsuk-button--secondary')).eql(true)
    .expect(button.hasClass('nhsuk-button--disabled')).eql(false);
});

test('should render the edit button as not disabled', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="edit-button"] a');

  await t
    .expect(await extractInnerText(button)).eql('Edit Service Recipients')
    .expect(button.hasClass('nhsuk-button--secondary')).eql(true);
});

test('should show the correct error summary and input error when the price is removed and save is clicked', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');
  const errorMessage = Selector('#price-error span');
  const price = Selector('[data-test-id="question-price"] input');

  await t
    .expect(errorMessage.exists).notOk()
    .expect(price.hasClass('nhsuk-input--error')).notOk()
    .selectText(price).pressKey('delete')
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.PriceRequired)
    .expect(await extractInnerText(errorMessage)).eql('Error:')
    .expect(price.hasClass('nhsuk-input--error')).ok();
});

test('should navigate to catalogue-solutions dashboard page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put(`/api/v1/orders/${callOffId}/order-items/${catalogueItemId}`, validRequestBody)
    .reply(200, {});

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .click(saveButton)
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

  const errorSummary = Selector('[data-test-id="error-summary"]');
  const quantityInput = Selector('[data-test-id="question-quantity"] input');
  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .typeText(quantityInput, '0', { replace: true })
    .click(saveButton);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql(content.errorMessages.QuantityGreaterThanZero)

    .expect(quantityInput.getAttribute('value')).eql('0');
});

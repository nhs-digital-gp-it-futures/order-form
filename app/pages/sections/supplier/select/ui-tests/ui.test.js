import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-id/supplier/search/select';

const suppliersFoundInSession = JSON.stringify([
  { supplierId: 'supplier-1', name: 'Supplier 1' },
  { supplierId: 'supplier-2', name: 'Supplier 2' },
]);

const selectedSupplierInSession = 'supplier-2';

const mocks = (data) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, data);
};

const defaultPageSetup = { withAuth: true, getRoute: true, mockData: {} };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks(setup.mockData);
    await setState(ClientFunction)(sessionKeys.suppliersFound, suppliersFoundInSession);
  }
};

const orderData = { name: 'a lovely order' };

const getLocation = ClientFunction(() => document.location.href);

fixture('Supplier select page')
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

test('should render Supplier select page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="supplier-select-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-id/supplier/search for backLink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id/supplier/search');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="supplier-select-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(content.title);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="supplier-select-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectSupplier question as radio button options', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectSupplierRadioOptions = Selector('[data-test-id="question-selectSupplier"]');

  await t
    .expect(await extractInnerText(selectSupplierRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectSupplierRadioOptions.find('input').count).eql(2)

    .expect(selectSupplierRadioOptions.find('input').nth(0).getAttribute('value')).eql('supplier-1')
    .expect(await extractInnerText(selectSupplierRadioOptions.find('label').nth(0))).eql('Supplier 1')

    .expect(selectSupplierRadioOptions.find('input').nth(1).getAttribute('value')).eql('supplier-2')
    .expect(await extractInnerText(selectSupplierRadioOptions.find('label').nth(1))).eql('Supplier 2');
});

test('should render the radioButton as checked for the selectedSupplier', async (t) => {
  await setState(ClientFunction)(sessionKeys.selectedSupplier, selectedSupplierInSession);

  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectSupplierRadioOptions = Selector('[data-test-id="question-selectSupplier"]');

  await t
    .expect(selectSupplierRadioOptions.find('.nhsuk-radios__item').count).eql(2)
    .expect(selectSupplierRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input:checked').exists).notOk()
    .expect(selectSupplierRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input:checked').exists).ok();
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect back to /organisation/odsCode/order/order-id/supplier/search when no suppliers are returned', async (t) => {
  mocks({});

  await pageSetup({ ...defaultPageSetup, withAuth: true, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id/supplier/search');
});

test('should show the error summary when there are validation errors', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(button);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a'))).eql('Select a supplier');
});

test('should select supplier field as errors with error message when there are validation errors', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const supplierSelectPage = Selector('[data-test-id="supplier-select-page"]');
  const continueButton = Selector('[data-test-id="continue-button"] button');
  const supplierSelectField = supplierSelectPage.find('[data-test-id="question-selectSupplier"]');

  await t
    .expect(supplierSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(supplierSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(supplierSelectField.find('#selectSupplier-error'))).contains('Select a supplier');
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(continueButton);

  await t
    .expect(errorSummary.exists).ok()
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#selectSupplier`);
});

test('should redirect to /organisation/odsCode/order/order-id/supplier when ORDAPI returns order data', async (t) => {
  await pageSetup({ ...defaultPageSetup, mockData: orderData });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id/supplier');
});

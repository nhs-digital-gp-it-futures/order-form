import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/supplier/search/select';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const suppliersFoundState = ClientFunction(() => {
  const cookieValue = JSON.stringify([
    { supplierId: 'supplier-1', name: 'Supplier 1' },
    { supplierId: 'supplier-2', name: 'Supplier 2' },
  ]);

  document.cookie = `suppliersFound=${cookieValue}`;
});

const selectedSuppliersState = ClientFunction(() => {
  const cookieValue = 'supplier-2';

  document.cookie = `selectedSupplier=${cookieValue}`;
});

const mocks = (data) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, data);
};

const pageSetup = async (withAuth = true, withSuppliersFoundState = false, withSelectedSuppliersState = false, data = {}) => {
  if (withAuth) {
    mocks(data);
    await setCookies();
  }
  if (withSuppliersFoundState) await suppliersFoundState();
  if (withSelectedSuppliersState) await selectedSuppliersState();
};

const orderData = { name: 'a lovely order' };

const getLocation = ClientFunction(() => document.location.href);

fixture('Supplier select page')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    if (process.env.NOCK_CHECK) {
      const isDone = nock.isDone();
      if (!isDone) {
        // eslint-disable-next-line no-console
        console.log(`pending mocks: ${nock.pendingMocks()}`);
        nock.cleanAll();
      }

      await t.expect(isDone).ok('Not all nock interceptors were used!');
    }
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

test('should render Supplier select page', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="supplier-select-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id/supplier/search when click on backlink', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/supplier/search');
});

test('should render the title', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="supplier-select-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(content.title);
});

test('should render the description', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="supplier-select-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectSupplier question as radio button options', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const selectSupplierRadioOptions = Selector('[data-test-id="question-selectSupplier"]');

  await t
    .expect(selectSupplierRadioOptions.exists).ok()
    .expect(await extractInnerText(selectSupplierRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectSupplierRadioOptions.find('input').count).eql(2)

    .expect(selectSupplierRadioOptions.find('input').nth(0).getAttribute('value')).eql('supplier-1')
    .expect(await extractInnerText(selectSupplierRadioOptions.find('label').nth(0))).eql('Supplier 1')

    .expect(selectSupplierRadioOptions.find('input').nth(1).getAttribute('value')).eql('supplier-2')
    .expect(await extractInnerText(selectSupplierRadioOptions.find('label').nth(1))).eql('Supplier 2');
});

test('should render the radioButton as checked for the selectedSupplier', async (t) => {
  await pageSetup(true, true, true);
  await t.navigateTo(pageUrl);

  const selectSupplierRadioOptions = Selector('[data-test-id="question-selectSupplier"]');

  await t
    .expect(selectSupplierRadioOptions.exists).ok()
    .expect(selectSupplierRadioOptions.find('.nhsuk-radios__item').count).eql(2)
    .expect(selectSupplierRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input:checked').exists).notOk()
    .expect(selectSupplierRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input:checked').exists).ok();
});

test('should render the Continue button', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect back to /organisation/order-id/supplier/search no suppliers are returned', async (t) => {
  await pageSetup(true, false);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/supplier/search');
});

test('should show the error summary when there are validation errors', async (t) => {
  await pageSetup(true, true);
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
  await pageSetup(true, true);
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
  await pageSetup(true, true);
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

test('should redirect to /organisation/order-id/supplier when ORDAPI returns order data', async (t) => {
  await pageSetup(true, true, false, orderData);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/supplier');
});

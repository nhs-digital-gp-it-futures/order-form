import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/funding-source';

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/funding-source')
    .reply(200, {});
};

const pageSetup = async (setup = { withAuth: true }) => {
  if (setup.withAuth) {
    mocks();
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Funding source page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ withAuth: false, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render funding source page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="funding-source-page"]');

  await t
    .expect(page.exists).ok();
});

test('should render go back link with href /organisation/order-id', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="funding-source-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="funding-source-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectFundingSource question as radio button options', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectFundingSourceRadioOptions = Selector('[data-test-id="question-selectFundingSource"]');

  await t
    .expect(await extractInnerText(selectFundingSourceRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectFundingSourceRadioOptions.find('input').count).eql(2)

    .expect(selectFundingSourceRadioOptions.find('input').nth(0).getAttribute('value')).eql('true')
    .expect(await extractInnerText(selectFundingSourceRadioOptions.find('label').nth(0))).eql('Yes')

    .expect(selectFundingSourceRadioOptions.find('input').nth(1).getAttribute('value')).eql('false')
    .expect(await extractInnerText(selectFundingSourceRadioOptions.find('label').nth(1))).eql('No');
});

test('should render save button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});

test('should navigate to task list page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/funding-source', { onlyGMS: true })
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectFundingSourceRadioOptions = Selector('[data-test-id="question-selectFundingSource"]');
  const button = Selector('[data-test-id="save-button"] button');

  await t
    .click(selectFundingSourceRadioOptions.find('input').nth(0))
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

test('should render the title on validation error', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');
  const title = Selector('h1[data-test-id="funding-source-page-title"]');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`)
    .click(button);

  await t
    .expect(errorSummary.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should show the error summary when no funding source selected causing validation error', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(button);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a'))).eql('Select yes if you\'re paying for this order in full using your GP IT Futures centrally held funding allocation');
});

test('should render select funding source field as errors with error message when no funding source selected causing validation error', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const fundingSourceSelectPage = Selector('[data-test-id="funding-source-page"]');
  const continueButton = Selector('[data-test-id="save-button"] button');
  const fundingSourceSelectField = fundingSourceSelectPage.find('[data-test-id="question-selectFundingSource"]');

  await t
    .expect(fundingSourceSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(fundingSourceSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(fundingSourceSelectField.find('#selectFundingSource-error'))).contains('Select yes if you\'re paying for this order in full using your GP IT Futures centrally held funding allocation');
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(continueButton);

  await t
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#selectFundingSource`);
});

test('should render the inset advice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  await Promise.all(content.insetAdvice.map(async (advice, idx) => {
    const selectedAdvice = Selector(`div[data-test-id="funding-source-page-insetAdvice"] p:nth-child(${idx + 1})`);
    await t.expect(await extractInnerText(selectedAdvice)).eql(advice);
  }));
});

import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../test-utils/uiTestHelper';
import { orderApiUrl } from '../../../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/select/solution/price/recipient';

const selectedItemNameInSession = 'Solution One';
const mockServiceRecipients = [
  {
    odsCode: 'recipient-1',
    name: 'Recipient 1',
  },
  {
    odsCode: 'recipient-2',
    name: 'Recipient 2',
  },
];

const recipientsInSession = JSON.stringify(mockServiceRecipients);

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/service-recipients')
    .reply(200, { serviceRecipients: mockServiceRecipients });
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
    await setState(ClientFunction)('selectedItemName', selectedItemNameInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)('recipients', recipientsInSession);
  }
};


const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions - recipient page - general')
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

test('should render Catalogue-solutions select-recipient page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="solution-recipient-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /organisation/order-id/catalogue-solutions/select/solution/price for backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id/catalogue-solutions/select/solution/price');
});

test('should link to /organisation/order-id/catalogue-solutions/select/solution/price for backlink with validation errors', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');
  const button = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(button);

  await t
    .expect(errorSummary.exists).ok()
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id/catalogue-solutions/select/solution/price');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="solution-recipient-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} Solution One`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="solution-recipient-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectRecipient question as radio button options', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectRecipientRadioOptions = Selector('[data-test-id="question-selectRecipient"]');

  await t
    .expect(selectRecipientRadioOptions.exists).ok()
    .expect(await extractInnerText(selectRecipientRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectRecipientRadioOptions.find('input').count).eql(2)

    .expect(selectRecipientRadioOptions.find('input').nth(0).getAttribute('value')).eql('recipient-1')
    .expect(await extractInnerText(selectRecipientRadioOptions.find('label').nth(0))).eql('Recipient 1 (recipient-1)')

    .expect(selectRecipientRadioOptions.find('input').nth(1).getAttribute('value')).eql('recipient-2')
    .expect(await extractInnerText(selectRecipientRadioOptions.find('label').nth(1))).eql('Recipient 2 (recipient-2)');
});


test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect to /organisation/order-id/catalogue-solutions/neworderitem when a recipient is selected', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const selectRecipientRadioOptions = Selector('[data-test-id="question-selectRecipient"]');
  const firstRecipient = selectRecipientRadioOptions.find('input').nth(0);
  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .click(firstRecipient)
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions/neworderitem');
});

test('should show the error summary when no solution selected causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(button);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a'))).eql('Select a Service Recipient');
});

test('should render select recipient field as errors with error message when no solution selected causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const solutionRecipientPage = Selector('[data-test-id="solution-recipient-page"]');
  const continueButton = Selector('[data-test-id="continue-button"] button');
  const recipientSelectField = solutionRecipientPage.find('[data-test-id="question-selectRecipient"]');

  await t
    .expect(recipientSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(recipientSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(recipientSelectField.find('#selectRecipient-error'))).contains('Select a Service Recipient');
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(continueButton);

  await t
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#selectRecipient`);
});

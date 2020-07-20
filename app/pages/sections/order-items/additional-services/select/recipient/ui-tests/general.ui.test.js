import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../../../config';
import { nockAndErrorCheck } from '../../../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service/price/recipient';


const authTokenInSession = JSON.stringify({
  id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
});


const selectedItemName = 'Additional Service';

const serviceRecipients = [
  {
    odsCode: 'recipient-1',
    name: 'Recipient 1',
  },
  {
    odsCode: 'recipient-2',
    name: 'Recipient 2',
  },
];

const setState = ClientFunction((key, value) => {
  document.cookie = `${key}=${value}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/service-recipients')
    .reply(200, { serviceRecipients });
};

const pageSetup = async (withAuth = true, postRoute = true) => {
  if (withAuth) {
    mocks();
    await setState('fakeToken', authTokenInSession);
    await setState('selectedItemName', selectedItemName);
    if (postRoute) {
      await setState('recipients', JSON.stringify(serviceRecipients));
    }
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Additional-service - recipient page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
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

test('should render Additional-service select-recipient page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="additional-service-recipient-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to organisation/order-id/additional-services/select/additional-service/price when click on backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service/price');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="additional-service-recipient-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} Additional Service`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="additional-service-recipient-page-description"]');

  await t
    .expect(description.exists).ok()
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
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect to /organisation/order-id/additional-services/neworderitem when a recipient is selected', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const selectRecipientRadioOptions = Selector('[data-test-id="question-selectRecipient"]');
  const firstRecipient = selectRecipientRadioOptions.find('input').nth(0);
  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .click(firstRecipient)
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/additional-services/neworderitem');
});

test('should show the error summary when no additionalService selected causing validation error', async (t) => {
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
    .expect(await extractInnerText(errorSummary.find('li a'))).eql('Select a Service Recipient');
});

test('should render select recipient field as errors with error message when no additionalService selected causing validation error', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const additionalServiceRecipientPage = Selector('[data-test-id="additional-service-recipient-page"]');
  const continueButton = Selector('[data-test-id="continue-button"] button');
  const recipientSelectField = additionalServiceRecipientPage.find('[data-test-id="question-selectRecipient"]');

  await t
    .expect(recipientSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(recipientSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(recipientSelectField.find('#selectRecipient-error'))).contains('Select a Service Recipient');
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
    .expect(getLocation()).eql(`${pageUrl}#selectRecipient`);
});

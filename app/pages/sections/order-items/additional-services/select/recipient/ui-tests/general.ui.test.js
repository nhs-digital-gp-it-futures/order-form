import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../../../config';
import { nockCheck } from '../../../../../../../test-utils/nockChecker';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service/price/recipient';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const selectedItemNameState = ClientFunction(() => {
  const cookieValue = 'Additional Service';

  document.cookie = `selectedItemName=${cookieValue}`;
});

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

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/service-recipients')
    .reply(200, { serviceRecipients: mockServiceRecipients });
};

const pageSetup = async (withAuth = true) => {
  if (withAuth) {
    mocks();
    await setCookies();
    await selectedItemNameState();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Additional-service - recipient page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async () => {
    await nockCheck(nock);
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

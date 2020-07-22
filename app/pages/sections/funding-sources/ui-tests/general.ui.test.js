import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../config';
import { nockCheck } from '../../../../test-utils/nockChecker';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/funding-sources';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/funding-source')
    .reply(200, {});
};

const pageSetup = async (withAuth = true) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Funding sources page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockCheck(nock, t);
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

test('should render funding sources page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="funding-sources-page"]');

  await t
    .expect(page.exists).ok();
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="funding-sources-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="funding-sources-page-description"]');

  await t
    .expect(description.exists).ok()
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
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});

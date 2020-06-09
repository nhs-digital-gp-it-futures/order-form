import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl, solutionsApiUrl } from '../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/select-solution/select-price';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const solutionsFoundState = ClientFunction(() => {
  document.cookie = 'selectedSolution=solution-1';
});

const mockSolutionPricing = {
  id: 'solution-1',
  name: 'name',
  prices: [
    {
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
    },
    {
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'licence',
        description: 'per licence',
      },
      price: 525.052,
    },
    {
      type: 'tiered',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'consultation',
        description: 'per consultation',
        tierName: 'consultations',
      },
      timeUnit: {
        name: 'month',
        description: 'per month',
      },
      tieringPeriod: 3,
      tiers: [
        {
          start: 1,
          end: 10,
          price: 700.0,
        },
        {
          start: 11,
          price: 400.0,
        },
      ],
    },
  ],
};

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/solutions/solution-1/pricing')
    .reply(200, mockSolutionPricing);
};

const pageSetup = async (t, withAuth = false, withSolutionsFoundState = true) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
  if (withSolutionsFoundState) await solutionsFoundState();
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions price page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  await pageSetup(t, false, false);
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render Catalogue-solutions price page', async (t) => {
  await pageSetup(t, true);

  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="solutions-price-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id/catalogue-solutions/select-solution when click on backlink', async (t) => {
  await pageSetup(t, true, true);
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, { supplierId: 'supp-1' });
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions/select-solution');
});

test('should render the title', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="solutions-price-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="solutions-price-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectSolutionPrice question as radio button options', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const selectSolutionPriceRadioOptions = Selector('[data-test-id="question-selectSolutionPrice"]');

  await t
    .expect(selectSolutionPriceRadioOptions.exists).ok()
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectSolutionPriceRadioOptions.find('input').count).eql(3)

    .expect(selectSolutionPriceRadioOptions.find('input').nth(0).getAttribute('value')).eql('£1.64 per patient per year')
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('label').nth(0))).eql('£1.64 per patient per year')

    .expect(selectSolutionPriceRadioOptions.find('input').nth(1).getAttribute('value')).eql('£525.052 per licence ')
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('label').nth(1))).eql('£525.052 per licence')

    .expect(selectSolutionPriceRadioOptions.find('input').nth(2).getAttribute('value')).eql('<div>1 - 10 consultations £700 per consultation per month</div><div>11+ consultations £400 per consultation per month</div>')
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('label').nth(2))).eql('1 - 10 consultations £700 per consultation per month\n11+ consultations £400 per consultation per month');
});

test('should render the Continue button', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

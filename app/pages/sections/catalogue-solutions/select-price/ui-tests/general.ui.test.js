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
  name: 'Solution name',
  prices: [
    {
      priceId: '0001',
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
      priceId: '0002',
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'licence',
        description: 'per licence',
      },
      price: 525.052,
    },
    {
      priceId: '0003',
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

const solutionPricesState = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: 'solution-1',
    name: 'Solution name',
    prices: [
      {
        priceId: '0001',
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
        priceId: '0002',
        type: 'flat',
        currencyCode: 'GBP',
        itemUnit: {
          name: 'licence',
          description: 'per licence',
        },
        price: 525.052,
      },
      {
        priceId: '0003',
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
  });
  document.cookie = `solutionPrices=${cookieValue}`;
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/solutions/solution-1/pricing')
    .reply(200, mockSolutionPricing);
};

const pageSetup = async (withAuth = false, withSolutionsFoundState = true, withsolutionPricesState = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
  if (withSolutionsFoundState) await solutionsFoundState();
  if (withsolutionPricesState) await solutionPricesState();
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
  await pageSetup(false, false);
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render Catalogue-solutions price page', async (t) => {
  await pageSetup(true);

  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="solution-price-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id/catalogue-solutions/select-solution when click on backlink', async (t) => {
  await pageSetup(true);
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
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="solution-price-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} Solution name`);
});

test('should render the description', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="solution-price-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectSolutionPrice question as radio button options', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const selectSolutionPriceRadioOptions = Selector('[data-test-id="question-selectSolutionPrice"]');

  await t
    .expect(selectSolutionPriceRadioOptions.exists).ok()
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectSolutionPriceRadioOptions.find('input').count).eql(3)

    .expect(selectSolutionPriceRadioOptions.find('input').nth(0).getAttribute('value')).eql('0001')
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('label').nth(0))).eql('£1.64 per patient per year')

    .expect(selectSolutionPriceRadioOptions.find('input').nth(1).getAttribute('value')).eql('0002')
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('label').nth(1))).eql('£525.052 per licence')

    .expect(selectSolutionPriceRadioOptions.find('input').nth(2).getAttribute('value')).eql('0003')
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('label').nth(2))).eql('1 - 10 consultations £700 per consultation per month\n11+ consultations £400 per consultation per month');
});

test('should render the Continue button', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect to /organisation/order-id/catalogue-solutions/select-solution/select-price/select-recipient when a price is selected', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const selectSolutionRadioOptions = Selector('[data-test-id="question-selectSolutionPrice"]');
  const firstSolution = selectSolutionRadioOptions.find('input').nth(0);
  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .click(firstSolution)
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions/select-solution/select-price/select-recipient');
});

test('should show the error summary when no price selected causing validation error', async (t) => {
  await pageSetup(true, true, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(button);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a'))).eql('Select a List price');
});

test('should render select solution field as errors with error message when no price selected causing validation error', async (t) => {
  await pageSetup(true, true, true);
  await t.navigateTo(pageUrl);

  const solutionSelectPage = Selector('[data-test-id="solution-price-page"]');
  const continueButton = Selector('[data-test-id="continue-button"] button');
  const solutionSelectField = solutionSelectPage.find('[data-test-id="question-selectSolutionPrice"]');

  await t
    .expect(solutionSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(solutionSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(solutionSelectField.find('#selectSolutionPrice-error'))).contains('Select a List price');
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  await pageSetup(true, true, true);
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(continueButton);

  await t
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#selectSolutionPrice`);
});

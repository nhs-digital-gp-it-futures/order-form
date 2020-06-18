import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/select/solution';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockSolutions = [
  {
    id: 'solution-1',
    name: 'Solution 1',
  },
  {
    id: 'solution-2',
    name: 'Solution 2',
  },
];

const solutionsState = ClientFunction(() => {
  const cookieValue = JSON.stringify([
    {
      id: 'solution-1',
      name: 'Solution 1',
    },
    {
      id: 'solution-2',
      name: 'Solution 2',
    },
  ]);

  document.cookie = `solutions=${cookieValue}`;
});

const selectedSolutionIdState = ClientFunction(() => {
  const cookieValue = 'solution-2';

  document.cookie = `selectedSolutionId=${cookieValue}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, { supplierId: 'supp-1' });
  nock(solutionsApiUrl)
    .get('/api/v1/solutions?supplierId=supp-1')
    .reply(200, { solutions: mockSolutions });
};

const pageSetup = async (
  withAuth = true, withSolutionsFoundState = false, withSelectedSolutionIdState = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
  if (withSolutionsFoundState) await solutionsState();
  if (withSelectedSolutionIdState) await selectedSolutionIdState();
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions - solution page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
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

test('should render Catalogue-solutions select page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="solution-select-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id/catalogue-solutions when click on backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="solution-select-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="solution-select-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectSolution question as radio button options', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectSolutionRadioOptions = Selector('[data-test-id="question-selectSolution"]');

  await t
    .expect(selectSolutionRadioOptions.exists).ok()
    .expect(await extractInnerText(selectSolutionRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectSolutionRadioOptions.find('input').count).eql(2)

    .expect(selectSolutionRadioOptions.find('input').nth(0).getAttribute('value')).eql('solution-1')
    .expect(await extractInnerText(selectSolutionRadioOptions.find('label').nth(0))).eql('Solution 1')

    .expect(selectSolutionRadioOptions.find('input').nth(1).getAttribute('value')).eql('solution-2')
    .expect(await extractInnerText(selectSolutionRadioOptions.find('label').nth(1))).eql('Solution 2');
});

test('should render the radioButton as checked for the selectedSolutionId', async (t) => {
  await pageSetup(true, true, true);
  await t.navigateTo(pageUrl);

  const selectSolutionRadioOptions = Selector('[data-test-id="question-selectSolution"]');

  await t
    .expect(selectSolutionRadioOptions.exists).ok()
    .expect(selectSolutionRadioOptions.find('.nhsuk-radios__item').count).eql(2)
    .expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input:checked').exists).notOk()
    .expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input:checked').exists).ok();
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect to /organisation/order-id/catalogue-solutions/select/solution/price when a solution is selected', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const selectSolutionRadioOptions = Selector('[data-test-id="question-selectSolution"]');
  const firstSolution = selectSolutionRadioOptions.find('input').nth(0);
  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .click(firstSolution)
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/catalogue-solutions/select/solution/price');
});

test('should show the error summary when no solution selected causing validation error', async (t) => {
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
    .expect(await extractInnerText(errorSummary.find('li a'))).eql('Select a Catalogue Solution');
});

test('should render select solution field as errors with error message when no solution selected causing validation error', async (t) => {
  await pageSetup(true, true);
  await t.navigateTo(pageUrl);

  const solutionSelectPage = Selector('[data-test-id="solution-select-page"]');
  const continueButton = Selector('[data-test-id="continue-button"] button');
  const solutionSelectField = solutionSelectPage.find('[data-test-id="question-selectSolution"]');

  await t
    .expect(solutionSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(solutionSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(solutionSelectField.find('#selectSolution-error'))).contains('Select a Catalogue Solution');
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
    .expect(getLocation()).eql(`${pageUrl}#selectSolution`);
});

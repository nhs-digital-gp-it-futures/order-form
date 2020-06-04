import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import commonContent from '../commonManifest.json';
import neworderPageContent from './manifest.json';
import { baseUrl } from '../../../config';

const pageUrl = 'http://localhost:1234/organisation/neworder';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113',
    name: 'Cool Dude',
    ordering: 'manage',
    primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('neworder task-list page')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  await pageSetup(t);
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render neworder task-list page', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="neworder-page"]');

  await t
    .expect(page.exists).ok();
});

test(`should navigate to ${baseUrl}/organisation when click Back`, async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .expect(goBackLink.getAttribute('href')).eql(`${baseUrl}/organisation`);
});

test('should render the title', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="neworder-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(neworderPageContent.title);
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="neworder-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(neworderPageContent.description);
});


test('should not render the order description details', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const orderDescriptionTitle = Selector('h3[data-test-id="neworder-order-description-title"]');
  const orderDescription = Selector('h4[data-test-id="neworder-order-description"]');

  await t
    .expect(orderDescriptionTitle.exists).notOk()
    .expect(orderDescription.exists).notOk();
});

// First Task First Item Tests
test('should render the first task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const firstTask = Selector('li[data-test-id="task-0"]');
  const firstTaskFirstItem = Selector('[data-test-id="task-0-item-0"]');

  await t
    .expect(firstTask.exists).ok()
    .expect(await extractInnerText(firstTask.find('h2 span'))).eql('1.')
    .expect(await extractInnerText(firstTask.find('h2 div'))).eql('Start your order')
    .expect(firstTaskFirstItem.exists).ok()
    .expect(await extractInnerText(firstTaskFirstItem.find('span'))).eql('Provide a description of your order');
});

test('should always render the first task and first item as a link', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const firstTaskFirstItem = Selector('li[data-test-id="task-0-item-0"]');

  await t
    .expect(firstTaskFirstItem.find('a').exists).ok()
    .click(firstTaskFirstItem.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/neworder/description`);
});

test('should not render the complete tag for the first task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const firstTaskFirstItemCompleteTag = Selector('[data-test-id="task-0-item-0-complete-tag"]');

  await t
    .expect(firstTaskFirstItemCompleteTag.exists).notOk();
});

// Second Task First Item Tests
test('should render the second task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const secondTask = Selector('li[data-test-id="task-1"]');
  const secondTaskFirstItem = Selector('[data-test-id="task-1-item-0"]');

  await t
    .expect(secondTask.exists).ok()
    .expect(await extractInnerText(secondTask.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(secondTask.find('h2 div'))).eql('Organisation information')
    .expect(secondTaskFirstItem.exists).ok()
    .expect(await extractInnerText(secondTaskFirstItem.find('span'))).eql('Provide Call-off Ordering Party information');
});

test('should render the second task and first item as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const secondTaskFirstItem = Selector('li[data-test-id="task-1-item-0"]');

  await t
    .expect(secondTaskFirstItem.find('a').exists).notOk();
});

test('should not render the complete tag for the second task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const secondTaskFirstItemCompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(secondTaskFirstItemCompleteTag.exists).notOk();
});

// Second Task Second Item Tests
test('should render the second task and second item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const secondTask = Selector('li[data-test-id="task-1"]');
  const secondTaskSecondItem = Selector('[data-test-id="task-1-item-1"]');

  await t
    .expect(secondTask.exists).ok()
    .expect(await extractInnerText(secondTask.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(secondTask.find('h2 div'))).eql('Organisation information')
    .expect(secondTaskSecondItem.exists).ok()
    .expect(await extractInnerText(secondTaskSecondItem.find('span'))).eql('Provide Supplier information');
});

test('should render the second task and second item as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const secondTaskSecondItem = Selector('li[data-test-id="task-1-item-1"]');

  await t
    .expect(secondTaskSecondItem.find('a').exists).notOk();
});

test('should not render the complete tag for the second task and second item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const secondTaskSecondItemCompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(secondTaskSecondItemCompleteTag.exists).notOk();
});

// Third Task First Item Tests
test('should render the third task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const thirdTask = Selector('li[data-test-id="task-2"]');
  const thirdTaskFirstItem = Selector('[data-test-id="task-2-item-0"]');

  await t
    .expect(thirdTask.exists).ok()
    .expect(await extractInnerText(thirdTask.find('h2 span'))).eql('3.')
    .expect(await extractInnerText(thirdTask.find('h2 div'))).eql('Commencement date')
    .expect(thirdTaskFirstItem.exists).ok()
    .expect(await extractInnerText(thirdTaskFirstItem.find('span'))).eql('Provide commencement date for this agreement');
});

test('should render the third task and first item as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const thirdTaskFirstItem = Selector('li[data-test-id="task-2-item-0"]');

  await t
    .expect(thirdTaskFirstItem.find('a').exists).notOk();
});

test('should not render the complete tag for the third task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const thirdTaskFirstItemCompleteTag = Selector('[data-test-id="task-2-item-0-complete-tag"]');

  await t
    .expect(thirdTaskFirstItemCompleteTag.exists).notOk();
});

// Forth Task First Item Tests
test('should render the forth task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const forthTask = Selector('li[data-test-id="task-3"]');
  const forthTaskFirstItem = Selector('[data-test-id="task-3-item-0"]');

  await t
    .expect(forthTask.exists).ok()
    .expect(await extractInnerText(forthTask.find('h2 span'))).eql('4.')
    .expect(await extractInnerText(forthTask.find('h2 div'))).eql('Select Service Recipients')
    .expect(forthTaskFirstItem.exists).ok()
    .expect(await extractInnerText(forthTaskFirstItem.find('span'))).eql('Select the organisations you are ordering for');
});

test('should render the forth task and first item as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const forthTaskFirstItem = Selector('li[data-test-id="task-3-item-0"]');

  await t
    .expect(forthTaskFirstItem.find('a').exists).notOk();
});

test('should not render the complete tag for the forth task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const forthTaskFirstItemCompleteTag = Selector('[data-test-id="task-3-item-0-complete-tag"]');

  await t
    .expect(forthTaskFirstItemCompleteTag.exists).notOk();
});

// Fifth Task First Item Tests
test('should render the fifth task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const fifthTask = Selector('li[data-test-id="task-4"]');
  const fifthTaskFirstItem = Selector('[data-test-id="task-4-item-0"]');

  await t
    .expect(fifthTask.exists).ok()
    .expect(await extractInnerText(fifthTask.find('h2 span'))).eql('5.')
    .expect(await extractInnerText(fifthTask.find('h2 div'))).eql('Add Catalogue Solutions')
    .expect(fifthTaskFirstItem.exists).ok()
    .expect(await extractInnerText(fifthTaskFirstItem.find('span'))).eql('Add Catalogue Solutions to your order');
});

test('should render the fifth task and first item as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const fifthTaskFirstItem = Selector('li[data-test-id="task-4-item-0"]');

  await t
    .expect(fifthTaskFirstItem.find('a').exists).notOk();
});

test('should not render the complete tag for the fifth task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const fifthTaskFirstItemCompleteTag = Selector('[data-test-id="task-4-item-0-complete-tag"]');

  await t
    .expect(fifthTaskFirstItemCompleteTag.exists).notOk();
});

// Buttons tests
test('should render the "Delete order" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const deleteOrderButton = Selector('[data-test-id="delete-order-button"]');

  await t
    .expect(deleteOrderButton.exists).ok()
    .expect(await extractInnerText(deleteOrderButton)).eql(commonContent.deleteOrderButton.text)
    .expect(deleteOrderButton.getAttribute('aria-label')).eql(commonContent.deleteOrderButton.disabledAltText)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(true);
});

test('should render the "Preview order summary" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const previewOrderButton = Selector('[data-test-id="preview-order-button"]');

  await t
    .expect(previewOrderButton.exists).ok()
    .expect(await extractInnerText(previewOrderButton)).eql(commonContent.previewOrderButton.text)
    .expect(previewOrderButton.getAttribute('aria-label')).eql(commonContent.previewOrderButton.disabledAltText)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(true);
});

test('should render the "Submit order" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const submitOrderButton = Selector('[data-test-id="submit-order-button"]');

  await t
    .expect(submitOrderButton.exists).ok()
    .expect(await extractInnerText(submitOrderButton)).eql(commonContent.submitOrderButton.text)
    .expect(submitOrderButton.getAttribute('aria-label')).eql(commonContent.submitOrderButton.disabledAltText)
    .expect(submitOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(false)
    .expect(submitOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(true);
});

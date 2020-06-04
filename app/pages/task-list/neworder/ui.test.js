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

// Task 1 Item 1 Tests
test('should render task 1 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task1 = Selector('li[data-test-id="task-0"]');
  const task1Item1 = Selector('[data-test-id="task-0-item-0"]');

  await t
    .expect(task1.exists).ok()
    .expect(await extractInnerText(task1.find('h2 span'))).eql('1.')
    .expect(await extractInnerText(task1.find('h2 div'))).eql('Start your order')
    .expect(task1Item1.exists).ok()
    .expect(await extractInnerText(task1Item1.find('span'))).eql('Provide a description of your order');
});

test('should always render task 1 item 1 as a link', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task1Item1 = Selector('li[data-test-id="task-0-item-0"]');

  await t
    .expect(task1Item1.find('a').exists).ok()
    .click(task1Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/neworder/description`);
});

test('should not render the complete tag for task 1 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task1Item1CompleteTag = Selector('[data-test-id="task-0-item-0-complete-tag"]');

  await t
    .expect(task1Item1CompleteTag.exists).notOk();
});

// Task 2 Item 1 Tests
test('should render task 2 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task2 = Selector('li[data-test-id="task-1"]');
  const task2Item1 = Selector('[data-test-id="task-1-item-0"]');

  await t
    .expect(task2.exists).ok()
    .expect(await extractInnerText(task2.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(task2.find('h2 div'))).eql('Organisation information')
    .expect(task2Item1.exists).ok()
    .expect(await extractInnerText(task2Item1.find('span'))).eql('Provide Call-off Ordering Party information');
});

test('should render task 2 item 1 as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task2Item1 = Selector('li[data-test-id="task-1-item-0"]');

  await t
    .expect(task2Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 2 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task2Item1CompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(task2Item1CompleteTag.exists).notOk();
});

// Task 2 Item 2 Tests
test('should render task 2 item 2', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task2 = Selector('li[data-test-id="task-1"]');
  const task2Item2 = Selector('[data-test-id="task-1-item-1"]');

  await t
    .expect(task2.exists).ok()
    .expect(await extractInnerText(task2.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(task2.find('h2 div'))).eql('Organisation information')
    .expect(task2Item2.exists).ok()
    .expect(await extractInnerText(task2Item2.find('span'))).eql('Provide Supplier information');
});

test('should render task 2 item 2 as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task2Item2 = Selector('li[data-test-id="task-1-item-1"]');

  await t
    .expect(task2Item2.find('a').exists).notOk();
});

test('should not render the complete tag for task 2 item 2', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task2Item2CompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(task2Item2CompleteTag.exists).notOk();
});

// Task 3 Item 1 Tests
test('should render task 3 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task3 = Selector('li[data-test-id="task-2"]');
  const task3Item1 = Selector('[data-test-id="task-2-item-0"]');

  await t
    .expect(task3.exists).ok()
    .expect(await extractInnerText(task3.find('h2 span'))).eql('3.')
    .expect(await extractInnerText(task3.find('h2 div'))).eql('Commencement date')
    .expect(task3Item1.exists).ok()
    .expect(await extractInnerText(task3Item1.find('span'))).eql('Provide commencement date for this agreement');
});

test('should render task 3 item 1 as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task3Item1 = Selector('li[data-test-id="task-2-item-0"]');

  await t
    .expect(task3Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 3 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task3Item1CompleteTag = Selector('[data-test-id="task-2-item-0-complete-tag"]');

  await t
    .expect(task3Item1CompleteTag.exists).notOk();
});

// Task 4 Item 1 Tests
test('should render task 4 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task4 = Selector('li[data-test-id="task-3"]');
  const task4Item1 = Selector('[data-test-id="task-3-item-0"]');

  await t
    .expect(task4.exists).ok()
    .expect(await extractInnerText(task4.find('h2 span'))).eql('4.')
    .expect(await extractInnerText(task4.find('h2 div'))).eql('Select Service Recipients')
    .expect(task4Item1.exists).ok()
    .expect(await extractInnerText(task4Item1.find('span'))).eql('Select the organisations you are ordering for');
});

test('should render task 4 item 1 as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task4Item1 = Selector('li[data-test-id="task-3-item-0"]');

  await t
    .expect(task4Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 4 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task4Item1CompleteTag = Selector('[data-test-id="task-3-item-0-complete-tag"]');

  await t
    .expect(task4Item1CompleteTag.exists).notOk();
});

// Task 5 Item 1 Tests
test('should render task 5 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task5 = Selector('li[data-test-id="task-4"]');
  const task5Item1 = Selector('[data-test-id="task-4-item-0"]');

  await t
    .expect(task5.exists).ok()
    .expect(await extractInnerText(task5.find('h2 span'))).eql('5.')
    .expect(await extractInnerText(task5.find('h2 div'))).eql('Add Catalogue Solutions')
    .expect(task5Item1.exists).ok()
    .expect(await extractInnerText(task5Item1.find('span'))).eql('Add Catalogue Solutions to your order');
});

test('should render task 5 item 1 as a text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task5Item1 = Selector('li[data-test-id="task-4-item-0"]');

  await t
    .expect(task5Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 5 item 1', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const task5Item1CompleteTag = Selector('[data-test-id="task-4-item-0-complete-tag"]');

  await t
    .expect(task5Item1CompleteTag.exists).notOk();
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

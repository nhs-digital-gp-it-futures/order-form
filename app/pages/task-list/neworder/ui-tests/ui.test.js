import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import commonContent from '../../commonManifest.json';
import neworderPageContent from '../manifest.json';
import { baseUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/neworder';

const pageSetup = async (setup = { withAuth: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Task-list page - new order')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ withAuth: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render neworder task-list page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="neworder-page"]');

  await t
    .expect(page.exists).ok();
});

test(`should link to ${baseUrl}/organisation for Back link`, async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/odsCode');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="neworder-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(neworderPageContent.title);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="neworder-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(neworderPageContent.description);
});

test('should not render the order description details', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescriptionTitle = Selector('h2[data-test-id="neworder-order-description-title"]');
  const orderDescription = Selector('p[data-test-id="neworder-order-description"]');

  await t
    .expect(orderDescriptionTitle.exists).notOk()
    .expect(orderDescription.exists).notOk();
});

// Task 1 Item 1 Tests
test('should render task 1 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task1 = Selector('li[data-test-id="task-0"]');
  const task1Item1 = Selector('[data-test-id="task-0-item-0"]');

  await t
    .expect(await extractInnerText(task1.find('h2 span'))).eql('1.')
    .expect(await extractInnerText(task1.find('h2 div'))).eql('Start your order')
    .expect(await extractInnerText(task1Item1.find('span'))).eql('Provide a description of your order');
});

test('should always render task 1 item 1 as a link', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task1Item1 = Selector('li[data-test-id="task-0-item-0"]');

  await t
    .click(task1Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/odsCode/order/neworder/description`);
});

test('should not render the complete tag for task 1 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task1Item1CompleteTag = Selector('[data-test-id="task-0-item-0-complete-tag"]');

  await t
    .expect(task1Item1CompleteTag.exists).notOk();
});

// Task 2 Item 1 Tests
test('should render task 2 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2 = Selector('li[data-test-id="task-1"]');
  const task2Item1 = Selector('[data-test-id="task-1-item-0"]');

  await t
    .expect(await extractInnerText(task2.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(task2.find('h2 div'))).eql('Organisation information')
    .expect(await extractInnerText(task2Item1.find('span'))).eql('Provide Call-off Ordering Party information');
});

test('should render task 2 item 1 as a text', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2Item1 = Selector('li[data-test-id="task-1-item-0"]');

  await t
    .expect(task2Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 2 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2Item1CompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(task2Item1CompleteTag.exists).notOk();
});

// Task 2 Item 2 Tests
test('should render task 2 item 2', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2 = Selector('li[data-test-id="task-1"]');
  const task2Item2 = Selector('[data-test-id="task-1-item-1"]');

  await t
    .expect(await extractInnerText(task2.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(task2.find('h2 div'))).eql('Organisation information')
    .expect(await extractInnerText(task2Item2.find('span'))).eql('Provide Supplier information');
});

test('should render task 2 item 2 as a text', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2Item2 = Selector('li[data-test-id="task-1-item-1"]');

  await t
    .expect(task2Item2.find('a').exists).notOk();
});

test('should not render the complete tag for task 2 item 2', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2Item2CompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(task2Item2CompleteTag.exists).notOk();
});

// Task 3 Item 1 Tests
test('should render task 3 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task3 = Selector('li[data-test-id="task-2"]');
  const task3Item1 = Selector('[data-test-id="task-2-item-0"]');

  await t
    .expect(await extractInnerText(task3.find('h2 span'))).eql('3.')
    .expect(await extractInnerText(task3.find('h2 div'))).eql('Commencement date')
    .expect(await extractInnerText(task3Item1.find('span'))).eql('Provide commencement date for this agreement');
});

test('should render task 3 item 1 as a text', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task3Item1 = Selector('li[data-test-id="task-2-item-0"]');

  await t
    .expect(task3Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 3 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task3Item1CompleteTag = Selector('[data-test-id="task-2-item-0-complete-tag"]');

  await t
    .expect(task3Item1CompleteTag.exists).notOk();
});

// Task 4 Item 1 Tests
test('should render task 4 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task4 = Selector('li[data-test-id="task-3"]');
  const task4Item1 = Selector('[data-test-id="task-3-item-0"]');

  await t
    .expect(await extractInnerText(task4.find('h2 span'))).eql('4.')
    .expect(await extractInnerText(task4.find('h2 div'))).eql('Add Catalogue Solutions')
    .expect(await extractInnerText(task4Item1.find('span'))).eql('Add Catalogue Solutions to your order');
});

test('should render task 4 item 1 as a text', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task4Item1 = Selector('li[data-test-id="task-3-item-0"]');

  await t
    .expect(task4Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 4 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task4Item1CompleteTag = Selector('[data-test-id="task-3-item-0-complete-tag"]');

  await t
    .expect(task4Item1CompleteTag.exists).notOk();
});

// Task 5 Item 1 Tests
test('should render task 5 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task5 = Selector('li[data-test-id="task-4"]');
  const task5Item1 = Selector('[data-test-id="task-4-item-0"]');

  await t
    .expect(await extractInnerText(task5.find('h2 span'))).eql('5.')
    .expect(await extractInnerText(task5.find('h2 div'))).eql('Add Additional Services')
    .expect(await extractInnerText(task5Item1.find('span'))).eql('Add Additional Services to your order');
});

test('should render task 5 item 1 as a text', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task5Item1 = Selector('li[data-test-id="task-4-item-0"]');

  await t
    .expect(task5Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 5 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task5Item1CompleteTag = Selector('[data-test-id="task-4-item-0-complete-tag"]');

  await t
    .expect(task5Item1CompleteTag.exists).notOk();
});

// Task 6 Item 1 Tests
test('should render task 6 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task6 = Selector('li[data-test-id="task-5"]');
  const task6Item1 = Selector('[data-test-id="task-5-item-0"]');

  await t
    .expect(await extractInnerText(task6.find('h2 span'))).eql('6.')
    .expect(await extractInnerText(task6.find('h2 div'))).eql('Add Associated Services')
    .expect(await extractInnerText(task6Item1.find('span'))).eql('Add Associated Services to your order');
});

test('should render task 6 item 1 as a text', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task6Item1 = Selector('li[data-test-id="task-5-item-0"]');

  await t
    .expect(task6Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 6 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task6Item1CompleteTag = Selector('[data-test-id="task-5-item-0-complete-tag"]');

  await t
    .expect(task6Item1CompleteTag.exists).notOk();
});

// Task 7 Item 1 Tests
test('should render task 7 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task7 = Selector('li[data-test-id="task-6"]');
  const task7Item1 = Selector('[data-test-id="task-6-item-0"]');

  await t
    .expect(task7.exists).ok()
    .expect(await extractInnerText(task7.find('h2 span'))).eql('7.')
    .expect(await extractInnerText(task7.find('h2 div'))).eql('Indicate funding source')
    .expect(task7Item1.exists).ok()
    .expect(await extractInnerText(task7Item1.find('span'))).eql('Explain how you\'re paying for this order');
});

test('should render task 7 item 1 as a text', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .expect(task7Item1.find('a').exists).notOk();
});

test('should not render the complete tag for task 7 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task7Item1CompleteTag = Selector('[data-test-id="task-6-item-0-complete-tag"]');

  await t
    .expect(task7Item1CompleteTag.exists).notOk();
});

// Buttons tests
test('should render the "Delete order" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const deleteOrderButton = Selector('[data-test-id="delete-order-button"]');

  await t
    .expect(await extractInnerText(deleteOrderButton)).eql(commonContent.deleteOrderButton.text)
    .expect(deleteOrderButton.find('span').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(deleteOrderButton.find('span').hasClass('nhsuk-button--disabled')).eql(true);
});

test('should render the "Preview order summary" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const previewOrderButton = Selector('[data-test-id="preview-order-button"]');

  await t
    .expect(await extractInnerText(previewOrderButton)).eql(commonContent.previewOrderButton.text)
    .expect(previewOrderButton.find('span').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(previewOrderButton.find('span').hasClass('nhsuk-button--disabled')).eql(true);
});

test('should render the "Complete order" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const completeOrderButton = Selector('[data-test-id="complete-order-button"]');

  await t
    .expect(await extractInnerText(completeOrderButton)).eql(commonContent.completeOrderButton.text)
    .expect(completeOrderButton.find('span').hasClass('nhsuk-button--secondary')).eql(false)
    .expect(completeOrderButton.find('span').hasClass('nhsuk-button--disabled')).eql(true);
});

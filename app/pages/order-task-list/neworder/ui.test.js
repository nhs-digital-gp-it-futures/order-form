import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from '../../../test-utils/helper';
import content from './manifest.json';
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
    .expect(await extractInnerText(title)).eql(content.title);
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="neworder-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the first task as Start your order task and description item as a href', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const taskList = Selector('[data-test-id="task-list"]');
  const firstTask = Selector('li[data-test-id="task-0"]');
  const firstTaskFirstItem = Selector('li[data-test-id="task-0-item-0"]');

  await t
    .expect(taskList.exists).ok()
    .expect(firstTask.exists).ok()
    .expect(await extractInnerText(firstTask.find('h2 span'))).eql('1.')
    .expect(await extractInnerText(firstTask.find('h2 div'))).eql('Start your order')
    .expect(firstTaskFirstItem.exists).ok()
    .expect(await extractInnerText(firstTaskFirstItem)).eql('Provide a description of your order')
    .expect(firstTaskFirstItem.find('a').getAttribute('href')).eql(`${baseUrl}/organisation/neworder/description`)
    .click(firstTaskFirstItem.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/neworder/description`);
});

test('should render the "Delete order" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const deleteOrderButton = Selector('[data-test-id="delete-order-button"]');

  await t
    .expect(deleteOrderButton.exists).ok()
    .expect(await extractInnerText(deleteOrderButton)).eql(content.deleteOrderButton.text)
    .expect(deleteOrderButton.getAttribute('aria-label')).eql(content.deleteOrderButton.altText)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(true);
});

test('should render the "Preview order summary" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const previewOrderButton = Selector('[data-test-id="preview-order-button"]');

  await t
    .expect(previewOrderButton.exists).ok()
    .expect(await extractInnerText(previewOrderButton)).eql(content.previewOrderButton.text)
    .expect(previewOrderButton.getAttribute('aria-label')).eql(content.previewOrderButton.altText)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(true);
});

test('should render the "Submit order" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const submitOrderButton = Selector('[data-test-id="submit-order-button"]');

  await t
    .expect(submitOrderButton.exists).ok()
    .expect(await extractInnerText(submitOrderButton)).eql(content.submitOrderButton.text)
    .expect(submitOrderButton.getAttribute('aria-label')).eql(content.submitOrderButton.altText)
    .expect(submitOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(false)
    .expect(submitOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(true);
});

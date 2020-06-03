import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../config';

const pageUrl = 'http://localhost:1234/organisation/order-id/catalogue-solutions';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/catalogue-solutions')
    .reply(200, { orderDescription: 'Some order', catalogueSolutions: [] });
};

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

fixture('Catalogue-solution page - without saved data')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should render the No solutions text when no catalogueSolutions are returned from ORDAPI', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const noAddedSolutions = Selector('[data-test-id="no-added-solutions"]');

  await t
    .expect(noAddedSolutions.exists).ok()
    .expect(await extractInnerText(noAddedSolutions)).eql(content.noSolutionsText);
});

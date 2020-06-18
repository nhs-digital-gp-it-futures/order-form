import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockAddedCatalogueSolutions = [
  {
    orderItemId: 'orderItem1',
    solutionName: 'Meditech Go',
    serviceRecipient: {
      name: 'Blue mountain',
      odsCode: 'A12000',
    },
  },
];

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/catalogue-solutions')
    .reply(200, { orderDescription: 'Some order', catalogueSolutions: mockAddedCatalogueSolutions });
};

const pageSetup = async () => {
  mocks();
  await setCookies();
};

fixture('Catalogue-solution page - without saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should render the list of the added catalogue solutions returned from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addedSolutions = Selector('[data-test-id="added-solutions"]');

  await t
    .expect(addedSolutions.exists).ok();
});

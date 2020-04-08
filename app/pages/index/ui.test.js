import { Selector } from 'testcafe';

const pageUrl = 'http://localhost:1234/';

fixture('Index page');

test('should render Organisations dashboard page', async (t) => {
  await t.navigateTo(pageUrl);
  const indexPage = Selector('[data-test-id="index-page"]');

  await t
    .expect(indexPage.exists).ok();
});

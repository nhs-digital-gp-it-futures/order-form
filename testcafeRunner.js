import createTestcafe from 'testcafe';
import { FakeAuthProvider, fakeSessionManager } from 'buying-catalogue-library';
import { App } from './app/app';
import { routes } from './app/routes';
import { env, baseUrl } from './app/config';

let testcafe;

const authProvider = new FakeAuthProvider();
const app = new App(authProvider).createApp();
app.use(baseUrl, routes(authProvider, fakeSessionManager()));
const server = app.listen('1234');

const [,, browserFromArgs, folderFromArgs, fileFromArgs] = process.argv;

const browserToRun = browserFromArgs || 'chrome:headless';
const testsToRun = `**/${folderFromArgs || '**'}/ui-tests/${fileFromArgs ? `${fileFromArgs}.` : '*'}ui.test.js`;

let stopOnFirstFail = true;
let quarantineMode = true;
if (env === 'pipeline' || browserFromArgs) {
  stopOnFirstFail = false;
  quarantineMode = false;
}

// eslint-disable-next-line no-console
console.log(`Running tests\nstopOnFirstFail is ${stopOnFirstFail}\nquarantineMode is ${quarantineMode}`);

createTestcafe('localhost')
  .then((tc) => {
    testcafe = tc;

    return testcafe.createRunner()
      .src(testsToRun)
      .browsers(browserToRun)
      .reporter(['spec', {
        name: 'nunit',
        output: 'integration-test-report.xml',
      }])
      .run({
        selectorTimeout: 3000,
        assertionTimeout: 1000,
        pageLoadTimeout: 5000,
        speed: 1,
        quarantineMode,
        stopOnFirstFail,
      });
  })
  .then(() => {
    server.close();
    testcafe.close();
  });

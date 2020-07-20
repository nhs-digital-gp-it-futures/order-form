import createTestcafe from 'testcafe';
import { FakeAuthProvider, fakeSessionManager } from 'buying-catalogue-library';
import { App } from './app/app';
import { routes } from './app/routes';
import { baseUrl } from './app/config';

let testcafe;

const authProvider = new FakeAuthProvider();
const app = new App(authProvider).createApp();
app.use(baseUrl, routes(authProvider, fakeSessionManager()));
const server = app.listen('1234');

const argv = process.argv.slice(2);

const argsMap = {
  b: {
    description: 'browser to run ui tests',
    value: 'chrome:headless',
  },
  p: {
    description: 'path of page to test',
    value: '',
  },
  f: {
    description: 'particular ui test file to test',
    value: '',
  },
  c: {
    description: 'number of concurrent threads',
    value: 2,
  },
  fp: {
    description: 'full path of test file',
    value: '',
  },
};

argv.map((arg) => {
  const [key, value] = arg.split('=');
  argsMap[key].value = value;
});

const pageToTest = argsMap.p.value;
const fileToTest = argsMap.f.value;
const browserToRun = argsMap.b.value;
const concurrency = parseInt(argsMap.c.value, 10);
const testsToRun = argsMap.fp.value
  ? argsMap.fp.value
  : `**/${pageToTest || '**'}/ui-tests/${fileToTest ? `${fileToTest}.` : '*'}ui.test.js`;

let stopOnFirstFail = true;
let quarantineMode = false;
let selectorTimeout = 3000;
let assertionTimeout = 1000;
let pageLoadTimeout = 5000;
let speed = 1;
process.env.NOCK_CHECK = 'true';

if (concurrency > 1) {
  selectorTimeout = 3000;
  assertionTimeout = 1000;
  pageLoadTimeout = 5000;
  speed = 1;
  stopOnFirstFail = true;
  quarantineMode = true;
  process.env.NOCK_CHECK = 'false';
}

// eslint-disable-next-line no-console
console.log(`Running tests\n
  tests Running is ${testsToRun}\n
  browserIs ${browserToRun}\n
  concurrency is ${concurrency}\n
  stopOnFirstFail is ${stopOnFirstFail}\n
  quarantineMode is ${quarantineMode}\n
  nockCheck is ${process.env.NOCK_CHECK}`);

createTestcafe('localhost')
  .then((tc) => {
    testcafe = tc;

    return testcafe.createRunner()
      .src(testsToRun)
      .browsers(browserToRun)
      .concurrency(concurrency)
      .reporter(['spec', {
        name: 'nunit',
        output: 'integration-test-report.xml',
      }])
      .run({
        selectorTimeout,
        assertionTimeout,
        pageLoadTimeout,
        speed,
        quarantineMode,
        stopOnFirstFail,
      });
  })
  .then(() => {
    server.close();
    testcafe.close();
  });

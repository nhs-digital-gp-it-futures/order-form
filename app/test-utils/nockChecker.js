const throwErrorRerunMessage = (message, filename) => {
  const errorMessage = [
    '--------------------------------------------------------',
    `TEST FAILED - ${message}`,
    'Rerun this Fixture with:',
    '',
    `> npm run test:integration fp=${filename} c=1`,
    '---------------------------------------------------------------',
  ].join('\n');

  throw new Error(errorMessage);
};

export const nockCheck = async (nock, t) => {
  if (process.env.NOCK_CHECK === 'true') {
    const isDone = nock.isDone();
    if (!isDone) {
      throwErrorRerunMessage(`Pending mocks: ${nock.pendingMocks()}`, t.testRun.test.testFile.filename);
    }
  }

  if (t.testRun.errs[0] && t.testRun.errs[0].isTestCafeError) {
    throwErrorRerunMessage(`Error in test: "${t.testRun.test.name}"`, t.testRun.test.testFile.filename);
  }
};

export const setState = ClientFunction => ClientFunction((key, value) => {
  document.cookie = `${key}=${value}`;
});

export const authTokenInSession = JSON.stringify({
  id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
});
